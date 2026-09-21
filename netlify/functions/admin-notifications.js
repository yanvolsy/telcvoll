const { db } = require('./_lib/db');
const { json } = require('./_lib/auth');
const { requireAdmin } = require('./_lib/guard');
const { sendEmail } = require('./_lib/email');
const { requireSameOrigin, requestSize } = require('./_lib/request');

/**
 * Resolve student recipients based on targeting criteria
 */
async function resolveRecipients(client, targetType, targetValue) {
  let query = `
    SELECT DISTINCT s.id AS student_id, s.name, s.email, c.code AS access_code, c.expires_at, p.name AS plan_name
    FROM students s
    JOIN access_codes c ON c.student_id=s.id
    JOIN plans p ON p.id=c.plan_id
  `;
  const params = [];
  const whereClauses = [];

  switch (targetType) {
    case 'active':
      whereClauses.push('c.active = TRUE AND c.expires_at > NOW()');
      break;
    case 'expired':
      whereClauses.push('(c.active = FALSE OR c.expires_at <= NOW())');
      break;
    case 'expiring_soon':
      whereClauses.push('c.active = TRUE AND c.expires_at > NOW() AND c.expires_at <= NOW() + INTERVAL \'3 days\'');
      break;
    case 'plan':
      params.push(parseInt(targetValue || 0, 10));
      whereClauses.push(`c.plan_id = $${params.length}`);
      break;
    case 'duration':
      params.push(parseInt(targetValue || 0, 10));
      whereClauses.push(`p.duration_days = $${params.length}`);
      break;
    case 'date_range':
      if (targetValue && targetValue.includes(':')) {
        const [from, to] = targetValue.split(':');
        params.push(from);
        params.push(to);
        whereClauses.push(`c.created_at >= $${params.length - 1}::timestamp AND c.created_at <= $${params.length}::timestamp`);
      }
      break;
    case 'specific_student':
      params.push(String(targetValue || '').trim().toLowerCase());
      whereClauses.push(`(LOWER(s.email) = $${params.length} OR s.id::text = $${params.length})`);
      break;
    case 'specific_code':
      params.push(String(targetValue || '').trim().toUpperCase().replace(/\s+/g, ''));
      whereClauses.push(`REPLACE(UPPER(c.code),' ','') = $${params.length}`);
      break;
    case 'all':
    default:
      // all students
      break;
  }

  if (whereClauses.length) {
    query += ' WHERE ' + whereClauses.join(' AND ');
  }

  query += ' ORDER BY s.id DESC';
  const res = await client.query(query, params);
  return res.rows;
}

exports.handler = async (event) => {
  if (!requireSameOrigin(event)) return json(403, { error: 'Cross-origin request blocked.' });
  if (!requestSize(event)) return json(413, { error: 'Request too large.' });
  if (!requireAdmin(event)) return json(401, { error: 'unauthenticated' });

  const pool = db();

  if (event.httpMethod === 'GET') {
    const url = new URL(event.rawUrl || 'http://localhost' + (event.path || '/'), 'http://localhost');
    const action = url.searchParams.get('action');

    // Count audience for targeting preview
    if (action === 'count') {
      const targetType = url.searchParams.get('target_type') || 'all';
      const targetValue = url.searchParams.get('target_value') || '';
      const client = await pool.connect();
      try {
        const rows = await resolveRecipients(client, targetType, targetValue);
        return json(200, { count: rows.length });
      } finally {
        client.release();
      }
    }

    const { rows } = await pool.query('SELECT * FROM admin_notifications ORDER BY id DESC');
    const plansRes = await pool.query('SELECT id, plan_key, name, duration_days FROM plans ORDER BY duration_days');
    return json(200, { notifications: rows, plans: plansRes.rows });
  }

  if (event.httpMethod === 'POST') {
    let body;
    try { body = JSON.parse(event.body || '{}'); } catch { return json(400, { error: 'Bad request' }); }

    const action = String(body.action || 'save');
    const client = await pool.connect();

    try {
      if (action === 'delete') {
        const id = parseInt(body.id, 10);
        if (!id) return json(422, { error: 'معرف التنبيه مطلوب.' });
        await client.query('DELETE FROM admin_notifications WHERE id=$1', [id]);
        return json(200, { ok: true });
      }

      if (action === 'toggle') {
        const id = parseInt(body.id, 10);
        if (!id) return json(422, { error: 'معرف التنبيه مطلوب.' });
        await client.query('UPDATE admin_notifications SET is_active = NOT is_active, updated_at=NOW() WHERE id=$1', [id]);
        return json(200, { ok: true });
      }

      // Create / update notification
      const id = parseInt(body.id || 0, 10);
      const title = String(body.title || '').trim();
      const message = String(body.message || '').trim();
      const type = ['info', 'important', 'warning', 'success', 'announcement'].includes(body.type) ? body.type : 'info';
      const priority = ['normal', 'high', 'urgent'].includes(body.priority) ? body.priority : 'normal';
      const targetType = String(body.target_type || 'all').trim();
      const targetValue = String(body.target_value || '').trim();
      const channel = ['in_app', 'email', 'both'].includes(body.channel) ? body.channel : 'in_app';
      const startAt = body.start_at ? new Date(body.start_at) : new Date();
      const endAt = body.end_at ? new Date(body.end_at) : null;
      const isActive = body.is_active !== false;

      if (!title || !message) {
        return json(422, { error: 'عنوان التنبيه ومحتواه مطلوبان.' });
      }

      let notifId = id;
      if (id) {
        await client.query(
          `UPDATE admin_notifications
           SET title=$1, message=$2, type=$3, priority=$4, target_type=$5, target_value=$6,
               channel=$7, start_at=$8, end_at=$9, is_active=$10, updated_at=NOW()
           WHERE id=$11`,
          [title, message, type, priority, targetType, targetValue, channel, startAt, endAt, isActive, id]
        );
      } else {
        const insertRes = await client.query(
          `INSERT INTO admin_notifications(title, message, type, priority, target_type, target_value, channel, start_at, end_at, is_active)
           VALUES($1, $2, $3, $4, $5, $6, $7, $8, $9, $10) RETURNING id`,
          [title, message, type, priority, targetType, targetValue, channel, startAt, endAt, isActive]
        );
        notifId = insertRes.rows[0].id;
      }

      // If channel includes email, trigger email sending to the target audience
      let emailResult = null;
      if ((channel === 'email' || channel === 'both') && isActive && !id) {
        const recipients = await resolveRecipients(client, targetType, targetValue);
        let sent = 0, failed = 0;

        const emailHtml = `
          <div style="font-family: Cairo, Arial, sans-serif; direction: rtl; text-align: right; max-width: 600px; margin: auto; padding: 20px; background: #fff; border: 1px solid #e1e8e5; border-radius: 16px;">
            <div style="background: #0d1310; padding: 20px; border-radius: 12px; text-align: center; color: #fff;">
              <h2 style="margin: 0; color: #fff;"><span style="color: #f47b20;">●</span> TELC Voll</h2>
            </div>
            <div style="padding: 24px 10px;">
              <h1 style="font-size: 20px; color: #0d1310; margin-bottom: 12px;">${escapeHtml(title)}</h1>
              <div style="font-size: 15px; line-height: 1.8; color: #3d5249; white-space: pre-wrap;">${escapeHtml(message)}</div>
              <div style="margin-top: 30px; text-align: center;">
                <a href="${process.env.SITE_URL || 'https://telcvoll.de'}" style="display: inline-block; background: #f47b20; color: #fff; text-decoration: none; padding: 12px 28px; border-radius: 10px; font-weight: bold;">فتح منصة TELC Voll ←</a>
              </div>
            </div>
            <div style="border-top: 1px solid #e1e8e5; padding-top: 15px; text-align: center; font-size: 12px; color: #83978f;">
              منصة TELC Voll للتدريب على الامتحانات · B1 · B2 · C1
            </div>
          </div>
        `;

        for (const r of recipients) {
          if (!r.email) continue;
          const res = await sendEmail({ to: r.email, subject: title, html: emailHtml });
          if (res.ok) sent++; else failed++;
        }
        emailResult = { total: recipients.length, sent, failed };
      }

      return json(200, { ok: true, id: notifId, email_result: emailResult });
    } catch (e) {
      console.error('[ADMIN NOTIFICATION ERROR]', e);
      return json(500, { error: 'حدث خطأ أثناء حفظ التنبيه: ' + e.message });
    } finally {
      client.release();
    }
  }

  return json(405, { error: 'Method not allowed' });
};

function escapeHtml(str) {
  return String(str ?? '').replace(/[&<>"']/g, c => ({
    '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;'
  }[c]));
}
