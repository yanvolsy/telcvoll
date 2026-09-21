// TELC Voll — Resend Email Integration Service
// Server-side only: never expose RESEND_API_KEY to client or public files.

const RESEND_API_URL = 'https://api.resend.com/emails';
const DEFAULT_SENDER = process.env.EMAIL_FROM || 'TELC Voll <noreply@telcvoll.de>';
const SITE_URL = process.env.SITE_URL || 'https://telcvoll.de';

/**
 * Send an email through Resend API
 */
async function sendEmail({ to, subject, html, replyTo }) {
  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey) {
    console.warn('[EMAIL WARNING] RESEND_API_KEY is not configured. Email not sent to:', to);
    return { ok: false, error: 'RESEND_API_KEY is not configured on server.' };
  }

  const recipients = Array.isArray(to) ? to : [String(to || '').trim()];
  const validRecipients = recipients.filter(e => e && e.includes('@'));
  if (!validRecipients.length) {
    return { ok: false, error: 'No valid recipient email address provided.' };
  }

  try {
    const payload = {
      from: DEFAULT_SENDER,
      to: validRecipients,
      subject: String(subject || 'TELC Voll').trim(),
      html: String(html || ''),
    };
    if (replyTo) payload.reply_to = replyTo;

    const res = await fetch(RESEND_API_URL, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey.trim()}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
    });

    const data = await res.json().catch(() => ({}));
    if (!res.ok) {
      const errMsg = data.message || data.error || `Resend API error (${res.status})`;
      console.error('[EMAIL ERROR]', errMsg, data);
      return { ok: false, error: errMsg, data };
    }

    return { ok: true, id: data.id };
  } catch (err) {
    console.error('[EMAIL EXCEPTION]', err);
    return { ok: false, error: err.message };
  }
}

/**
 * Send the official access code email after confirmed payment
 */
async function sendAccessCodeEmail({ to, name, planName, durationDays, expiresAt, accessCode }) {
  const formattedDate = expiresAt ? new Date(expiresAt).toLocaleDateString('ar-DZ', {
    year: 'numeric', month: 'long', day: 'numeric'
  }) : `${durationDays} يوماً`;

  const subject = `رمز الدخول إلى منصة TELC Voll — كود تفعيل B1 · B2 · C1`;
  const codeLink = `${SITE_URL}/?code=${encodeURIComponent(accessCode || '')}`;

  const html = `<!DOCTYPE html>
<html lang="ar" dir="rtl">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${subject}</title>
  <style>
    body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; background-color: #f6f8f7; margin: 0; padding: 0; color: #1a2e26; direction: rtl; text-align: right; }
    .container { max-width: 600px; margin: 25px auto; background: #ffffff; border-radius: 20px; overflow: hidden; box-shadow: 0 10px 30px rgba(0,0,0,0.06); border: 1px solid #e1e8e5; }
    .header { background: #0d1310; padding: 32px 30px; text-align: center; color: #ffffff; }
    .brand { font-size: 26px; font-weight: 900; letter-spacing: -0.02em; color: #ffffff; text-decoration: none; display: inline-flex; align-items: center; gap: 8px; }
    .dot { width: 10px; height: 10px; background-color: #f47b20; border-radius: 50%; display: inline-block; }
    .content { padding: 35px 30px; line-height: 1.7; }
    .badge { display: inline-block; background: #fff1e5; color: #f47b20; padding: 6px 14px; border-radius: 999px; font-size: 13px; font-weight: 800; margin-bottom: 18px; }
    h1 { font-size: 24px; margin: 0 0 12px; color: #0d1310; font-weight: 900; }
    p { margin: 10px 0; color: #495e55; font-size: 15px; }
    .order-box { background: #fbfdfc; border: 1px solid #e1e8e5; border-radius: 16px; padding: 18px 20px; margin: 24px 0; }
    .order-row { display: flex; justify-content: space-between; padding: 8px 0; border-bottom: 1px dashed #e1e8e5; font-size: 14px; }
    .order-row:last-child { border-bottom: none; }
    .order-row span { color: #6b7f76; }
    .order-row strong { color: #0d1310; }
    .code-card { background: #fff7f0; border: 2px dashed #f47b20; border-radius: 18px; padding: 24px 20px 20px; text-align: center; margin: 28px 0; }
    .code-label { font-size: 12px; font-weight: 900; color: #a4500b; margin-bottom: 10px; }
    .code-val { font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace; font-size: 30px; font-weight: 950; color: #f47b20; letter-spacing: 3px; direction: ltr; display: block; user-select: all; padding: 6px 0; }
    .code-copy { display: inline-block; background: #f47b20; color: #ffffff !important; text-decoration: none; padding: 12px 22px; border-radius: 10px; font-size: 14px; font-weight: 900; margin-top: 14px; }
    .code-help { font-size: 12px; color: #7b8c84; margin-top: 10px; line-height: 1.6; }
    .btn-wrap { text-align: center; margin: 30px 0; }
    .btn { display: inline-block; background: #f47b20; color: #ffffff !important; text-decoration: none; padding: 14px 34px; border-radius: 12px; font-size: 16px; font-weight: 800; }
    .steps { background: #f7faf9; border-radius: 14px; padding: 18px 22px; margin: 24px 0; font-size: 14px; color: #3d5249; }
    .steps ol { margin: 8px 0 0 20px; padding: 0; }
    .steps li { margin: 6px 0; }
    .footer { background: #fbfdfc; border-top: 1px solid #e1e8e5; padding: 22px; text-align: center; font-size: 12px; color: #83978f; line-height: 1.6; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <div class="brand"><span class="dot"></span> TELC Voll</div>
    </div>
    <div class="content">
      <div class="badge">تم تأكيد الدفع بنجاح ✓</div>
      <h1>مرحباً ${escapeHtml(name || 'عزيزي المشترك')}</h1>
      <p>شكراً لثقتك في منصة TELC Voll. تم تفعيل اشتراكك بنجاح لجميع مستويات المنصة <strong>B1 + B2 + C1</strong>.</p>
      
      <div class="order-box">
        <div class="order-row">
          <span>الخطة المفعلة:</span>
          <strong>${escapeHtml(planName)}</strong>
        </div>
        <div class="order-row">
          <span>مدة الاشتراك:</span>
          <strong>${escapeHtml(durationDays)} يوماً</strong>
        </div>
        <div class="order-row">
          <span>نطاق الوصول:</span>
          <strong>المنصة كاملة (B1 + B2 + C1)</strong>
        </div>
        <div class="order-row">
          <span>تاريخ انتهاء الصلاحية:</span>
          <strong>${formattedDate}</strong>
        </div>
      </div>

      <div class="code-card">
        <div class="code-label">رمز الدخول الخاص بك · ACCESS CODE</div>
        <div class="code-val">${escapeHtml(accessCode)}</div>
        <a class="code-copy" href="${escapeHtml(codeLink)}">فتح صفحة الدخول ونسخ الكود ←</a>
        <div class="code-help">يمكنك أيضًا تحديد الكود أعلاه ونسخه مباشرة. زر النسخ يفتح TELC Voll والكود مملوء تلقائيًا.</div>
      </div>

      <div class="steps">
        <strong>كيفية استخدام رمز الدخول:</strong>
        <ol>
          <li>توجه إلى الموقع الرسمي: <a href="${SITE_URL}" style="color:#f47b20;">${SITE_URL}</a></li>
          <li>في قسم <strong>دخول الطالب</strong>، ضع رمز الوصول الموضح أعلاه.</li>
          <li>اضغط على <strong>دخول إلى المنصة</strong> للبدء فوراً في التدريب على كافة الأقسام.</li>
        </ol>
      </div>

      <div class="btn-wrap">
        <a href="${SITE_URL}" class="btn">الدخول إلى المنصة الآن ←</a>
      </div>

      <p style="font-size:13px; color:#83978f; text-align:center;">احتفظ بهذا البريد الإلكتروني للرجوع إلى رمز الوصول الخاص بك في أي وقت.</p>
    </div>
    <div class="footer">
      <strong>TELC Voll</strong><br>
      German Exam Preparation Platform · B1 · B2 · C1<br>
      <a href="${SITE_URL}" style="color:#f47b20; text-decoration:none;">${SITE_URL}</a>
    </div>
  </div>
</body>
</html>`;

  return sendEmail({ to, subject, html });
}

function escapeHtml(str) {
  return String(str ?? '').replace(/[&<>"']/g, c => ({
    '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;'
  }[c]));
}

module.exports = {
  sendEmail,
  sendAccessCodeEmail,
};
