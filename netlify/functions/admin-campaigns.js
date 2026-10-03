const { db } = require('./_lib/db');
const { json } = require('./_lib/auth');
const { requireAdmin } = require('./_lib/guard');
const { sendEmail, wrapBrandedEmail, escapeHtml } = require('./_lib/email');
const { requireSameOrigin, requestSize } = require('./_lib/request');

/**
 * Resolve recipients for email campaigns
 */
async function resolveCampaignRecipients(client, targetType, targetValue) {
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
    case 'specific_email':
      params.push(String(targetValue || '').trim().toLowerCase());
      whereClauses.push(`LOWER(s.email) = $${params.length}`);
      break;
    case 'manual':
      if (Array.isArray(targetValue)) {
        const emails = targetValue.map(e => String(e).trim().toLowerCase()).filter(Boolean);
        if (emails.length) {
          params.push(emails);
          whereClauses.push(`LOWER(s.email) = ANY($${params.length})`);
        }
      }
      break;
    case 'all':
    default:
      break;
  }

  if (whereClauses.length) {
    query += ' AND ' + whereClauses.join(' AND ');
  }

  query += ' ORDER BY s.email, o.expires_at DESC NULLS LAST';
  const res = await client.query(query, params);
  return res.rows;
}

/**
 * Replace personalization variables
 */
function renderPersonalizedHtml(templateHtml, student) {
  const name = student.name || 'عزيزي المشترك';
  const email = student.email || '';
  const plan = student.plan_name || 'اشتراك TELC Voll';
  const expiresAt = student.expires_at ? new Date(student.expires_at).toLocaleDateString('ar-DZ') : '—';

  return templateHtml
    .replace(/\{\{\s*name\s*\}\}/gi, escapeHtml(name))
    .replace(/\{\{\s*email\s*\}\}/gi, escapeHtml(email))
    .replace(/\{\{\s*plan\s*\}\}/gi, escapeHtml(plan))
    .replace(/\{\{\s*expires_at\s*\}\}/gi, escapeHtml(expiresAt))
    
}

function wrapInOfficialTemplate(contentHtml, subject) {
  return wrapBrandedEmail(contentHtml, subject);
}


exports.handler = async (event) => {
  if (!requireSameOrigin(event)) return json(403, { error: 'Cross-origin request blocked.' });
  if (!requestSize(event)) return json(413, { error: 'Request too large.' });
  if (!await requireAdmin(event)) return json(401, { error: 'unauthenticated' });

  const pool = db();

  if (event.httpMethod === 'GET') {
    const url = new URL(event.rawUrl || 'http://localhost' + (event.path || '/'), 'http://localhost');
    const id = url.searchParams.get('id');
    const action = url.searchParams.get('action');

    // 1. Recipient count check for targeting
    if (action === 'count') {
      const targetType = url.searchParams.get('target_type') || 'all';
      const targetValue = url.searchParams.get('target_value') || '';
      const client = await pool.connect();
      try {
        const rows = await resolveCampaignRecipients(client, targetType, targetValue);
        return json(200, { count: rows.length });
      } finally {
        client.release();
      }
    }

    // 2. Specific campaign details with recipients
    if (id) {
      const campRes = await pool.query('SELECT * FROM email_campaigns WHERE id=$1', [id]);
      if (!campRes.rows.length) return json(404, { error: 'الحملة غير موجودة.' });
      const recipientsRes = await pool.query(
        'SELECT id, email, status, provider_id, error_message, sent_at FROM email_campaign_recipients WHERE campaign_id=$1 ORDER BY id ASC LIMIT 200',
        [id]
      );
      return json(200, { campaign: campRes.rows[0], recipients: recipientsRes.rows });
    }

    // 3. Campaign list & email statistics
    const campaignsRes = await pool.query('SELECT * FROM email_campaigns ORDER BY id DESC');
    const statsRes = await pool.query(`
      SELECT
        COALESCE(SUM(sent_count), 0)::int AS total_sent,
        COALESCE(SUM(failed_count), 0)::int AS total_failed,
        COUNT(*)::int AS total_campaigns,
        COALESCE(SUM(sent_count) FILTER (WHERE sent_at >= date_trunc('month', CURRENT_DATE)), 0)::int AS sent_this_month
      FROM email_campaigns
    `);

    const plansRes = await pool.query('SELECT id, plan_key, name, duration_days FROM plans ORDER BY duration_days');

    return json(200, {
      campaigns: campaignsRes.rows,
      stats: statsRes.rows[0] || {},
      plans: plansRes.rows
    });
  }

  if (event.httpMethod === 'POST') {
    let body;
    try { body = JSON.parse(event.body || '{}'); } catch { return json(400, { error: 'Bad request' }); }

    const action = String(body.action || '');
    const client = await pool.connect();

    try {
      // Send a single test email
      if (action === 'test') {
        const testEmail = String(body.test_email || '').trim().toLowerCase();
        const subject = String(body.subject || 'معاينة رسالة TELC Voll').trim();
        const rawContent = String(body.html_content || '').trim();

        if (!testEmail || !testEmail.includes('@')) {
          return json(422, { error: 'يرجى إدخال بريد إلكتروني تجريبي صحيح.' });
        }
        if (!rawContent) {
          return json(422, { error: 'محتوى الرسالة فارغ.' });
        }

        // Mock student data for variables
        const sampleStudent = {
          name: 'طالب تجريبي',
          email: testEmail,
          plan_name: 'خطة 30 يوماً B1+B2+C1',
          duration_days: 30,
          expires_at: new Date(Date.now() + 30 * 86400000),
        };

        const personalizedHtml = renderPersonalizedHtml(rawContent, sampleStudent);
        const finalEmailHtml = wrapInOfficialTemplate(personalizedHtml, subject);

        const emailRes = await sendEmail({
          to: testEmail,
          subject: `[تجريبي] ${subject}`,
          html: finalEmailHtml
        });

        if (!emailRes.ok) {
          return json(502, { error: 'فشل إرسال البريد التجريبي عبر Resend: ' + (emailRes.error || '') });
        }

        return json(200, { ok: true, message: 'تم إرسال البريد التجريبي بنجاح إلى: ' + testEmail });
      }

      // Duplicate campaign
      if (action === 'duplicate') {
        const sourceId = parseInt(body.id, 10);
        if (!sourceId) return json(422, { error: 'معرف الحملة مطلوب.' });
        const sourceRes = await client.query('SELECT * FROM email_campaigns WHERE id=$1', [sourceId]);
        const s = sourceRes.rows[0];
        if (!s) return json(404, { error: 'الحملة الأصلية غير موجودة.' });

        const dupRes = await client.query(
          `INSERT INTO email_campaigns(name, subject, html_content, target_type, target_value, recipient_count, status)
           VALUES($1, $2, $3, $4, $5, $6, 'DRAFT') RETURNING id`,
          [`نسخة من ${s.name}`, s.subject, s.html_content, s.target_type, s.target_value, s.recipient_count]
        );
        return json(200, { ok: true, id: dupRes.rows[0].id });
      }

      // Send actual campaign
      if (action === 'send') {
        const name = String(body.name || '').trim();
        const subject = String(body.subject || '').trim();
        const rawContent = String(body.html_content || '').trim();
        const targetType = String(body.target_type || 'all').trim();
        const targetValue = body.target_value || '';

        if (!name || !subject || !rawContent) {
          return json(422, { error: 'اسم الحملة وعنوان البريد والمحتوى مطلوبة بالكامل.' });
        }

        // 1. Resolve recipients server-side
        const recipients = await resolveCampaignRecipients(client, targetType, targetValue);
        if (!recipients.length) {
          return json(422, { error: 'لا يوجد أي طلاب مطابقين لشروط الاستهداف المحددة.' });
        }

        // 2. Insert campaign record in SENDING status
        const campRes = await client.query(
          `INSERT INTO email_campaigns(name, subject, html_content, target_type, target_value, recipient_count, status)
           VALUES($1, $2, $3, $4, $5, $6, 'SENDING') RETURNING id`,
          [name, subject, rawContent, targetType, typeof targetValue === 'object' ? JSON.stringify(targetValue) : String(targetValue), recipients.length]
        );
        const campaignId = campRes.rows[0].id;

        // 3. Controlled batch processing
        let sentCount = 0;
        let failedCount = 0;

        for (const r of recipients) {
          const personalizedHtml = renderPersonalizedHtml(rawContent, r);
          const finalEmailHtml = wrapInOfficialTemplate(personalizedHtml, subject);

          const emailRes = await sendEmail({
            to: r.email,
            subject: subject,
            html: finalEmailHtml
          });

          const status = emailRes.ok ? 'SENT' : 'FAILED';
          if (emailRes.ok) sentCount++; else failedCount++;

          await client.query(
            `INSERT INTO email_campaign_recipients(campaign_id, email, student_id, status, provider_id, error_message, sent_at)
             VALUES($1, $2, $3, $4, $5, $6, $7)`,
            [campaignId, r.email, r.student_id, status, emailRes.id || null, emailRes.error || null, emailRes.ok ? new Date() : null]
          );

          // Small delay (100ms) between sends to stay well within Resend rate limits
          await new Promise(resolve => setTimeout(resolve, 100));
        }

        const finalStatus = failedCount === 0 ? 'SENT' : (sentCount > 0 ? 'PARTIAL' : 'FAILED');
        await client.query(
          `UPDATE email_campaigns
           SET status=$1, sent_count=$2, failed_count=$3, sent_at=NOW()
           WHERE id=$4`,
          [finalStatus, sentCount, failedCount, campaignId]
        );

        return json(200, {
          ok: true,
          id: campaignId,
          recipient_count: recipients.length,
          sent_count: sentCount,
          failed_count: failedCount,
          status: finalStatus
        });
      }

      return json(400, { error: 'إجراء غير مدعوم.' });
    } catch (e) {
      console.error('[CAMPAIGN ERROR]', e);
      return json(500, { error: 'حدث خطأ أثناء معالجة الحملة.' });
    } finally {
      client.release();
    }
  }

  return json(405, { error: 'Method not allowed' });
};
