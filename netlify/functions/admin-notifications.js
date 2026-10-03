const { db } = require('./_lib/db');
const { json } = require('./_lib/auth');
const { requireAdmin } = require('./_lib/guard');
const { sendEmail, wrapBrandedEmail, escapeHtml } = require('./_lib/email');
const { requireSameOrigin, requestSize } = require('./_lib/request');

/**
 * Resolve student recipients based on targeting criteria
 */
async function resolveRecipients(client, targetType, targetValue) {
  let query = `
    SELECT DISTINCT ON (s.email) s.id AS student_id, s.name, s.email,
           o.expires_at, o.plan_id, p.name AS plan_name, p.duration_days
    FROM students s
    LEFT JOIN LATERAL (
      SELECT o.* FROM orders o
      WHERE o.student_id=s.id AND o.status='CONFIRMED'
      ORDER BY o.expires_at DESC, o.id DESC LIMIT 1
    ) o ON TRUE
    LEFT JOIN plans p ON p.id=o.plan_id
    WHERE s.email IS NOT NULL AND s.email != '' AND s.email LIKE '%@%.%'
  `;
  const params = [];
  const whereClauses = [];

  switch (targetType) {
    case 'active':
      whereClauses.push('o.expires_at > NOW()');
      break;
    case 'expired':
      whereClauses.push('(o.expires_at IS NULL OR o.expires_at <= NOW())');
      break;
    case 'expiring_soon':
      whereClauses.push('c.active = TRUE AND c.expires_at > NOW() AND c.expires_at <= NOW() + INTERVAL \'3 days\'');
      break;
    case 'plan':
      params.push(parseInt(targetValue || 0, 10));
      whereClauses.push(`o.plan_id = $${params.length}`);
      break;
    case 'duration':
      params.push(parseInt(targetValue || 0, 10));
      whereClauses.push(`o.duration_days = $${params.length}`);
      break;
    case 'date_range':
      if (targetValue && targetValue.includes(':')) {
        const [from, to] = targetValue.split(':');
        params.push(from);
        params.push(to);
        whereClauses.push(`o.created_at >= $${params.length - 1}::timestamp AND o.created_at <= $${params.length}::timestamp`);
      }
      break;
    case 'specific_student':
      params.push(String(targetValue || '').trim().toLowerCase());
      whereClauses.push(`(LOWER(s.email) = $${params.length} OR s.id::text = $${params.length})`);
      break;
    case 'specific_code':
      // Access-code targeting was removed with the legacy code system.
      whereClauses.push('1=0');
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
  if (!await requireAdmin(event)) return json(401, { error: 'unauthenticated' });

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

        const emailContent = `
          <h1 style="font-size:22px;color:#0d1310;margin:0 0 14px;font-weight:900;">${escapeHtml(title)}</h1>
          <div style="font-size:15px;line-height:1.9;color:#3d5249;white-space:pre-wrap;">${escapeHtml(message)}</div>
          <div style="margin-top:30px;text-align:center;">
            <a href="${escapeHtml(process.env.SITE_URL || 'https://telcvoll.de')}" target="_blank" style="display:inline-block;background:#f47b20;color:#fff;text-decoration:none;padding:12px 28px;border-radius:10px;font-weight:900;">فتح منصة TELC Voll ←</a>
          </div>
        `;
        const emailHtml = wrapBrandedEmail(emailContent, title, { compact: true });

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
      return json(500, { error: 'حدث خطأ أثناء حفظ التنبيه.' });
    } finally {
      client.release();
    }
  }

  return json(405, { error: 'Method not allowed' });
};

