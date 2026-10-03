// TELC Voll — Resend Email Integration Service
// Server-side only: never expose RESEND_API_KEY to client or public files.

const RESEND_API_URL = 'https://api.resend.com/emails';
const DEFAULT_SENDER = process.env.EMAIL_FROM || 'TELC Voll <noreply@telcvoll.de>';
const SITE_URL = process.env.SITE_URL || 'https://telcvoll.de';
const CLEAN_SITE_URL = SITE_URL.replace(/\/+$/, '');
const BRAND_LOGO_URL = `${CLEAN_SITE_URL}/assets/TELC_Voll_AppIcon_Light.png`;

// Single source of truth for every outgoing TELC Voll email.
const BRAND = Object.freeze({
  orange: '#f47b20',
  orangeDark: '#e36d12',
  dark: '#0d1310',
  darkBorder: '#26332d',
  text: '#17221d',
  muted: '#75847c',
  soft: '#f6f9f7',
  line: '#e1e9e4',
  green: '#168348',
});

/**
 * Send an email through Resend API.
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
 * Escape HTML values before inserting them into an email template.
 */
function escapeHtml(str) {
  return String(str ?? '').replace(/[&<>"']/g, c => ({
    '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;'
  }[c]));
}

/**
 * Build the common TELC Voll email shell.
 * Every transactional/admin email uses this same header, logo, title,
 * brand colors, border and footer so the mailbox presentation is consistent.
 */
function wrapBrandedEmail(contentHtml, subject, options = {}) {
  const safeSubject = escapeHtml(subject || 'TELC Voll');
  const safeContent = String(contentHtml || '');
  const compact = options.compact === true;
  const contentPadding = compact ? '26px 28px 24px' : '32px 32px 28px';

  return `<!doctype html>
<html lang="ar" dir="rtl" xmlns="http://www.w3.org/1999/xhtml">
<head>
  <meta http-equiv="Content-Type" content="text/html; charset=UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <meta name="color-scheme" content="light" />
  <title>${safeSubject}</title>
  <style type="text/css">
    body { margin:0; padding:0; width:100% !important; background:${BRAND.dark}; font-family:'Segoe UI',Tahoma,Arial,sans-serif; direction:rtl; text-align:right; color:${BRAND.text}; }
    table { border-spacing:0; }
    img { border:0; outline:none; text-decoration:none; }
    a { text-decoration:none; }
    .email-shell { width:100%; max-width:620px; }
    .mobile-padding { padding-left:18px !important; padding-right:18px !important; }
    @media only screen and (max-width:620px) {
      .email-shell { width:100% !important; }
      .mobile-padding { padding-left:18px !important; padding-right:18px !important; }
      .brand-name { font-size:22px !important; }
      .brand-tagline { font-size:10px !important; }
    }
  </style>
</head>
<body style="margin:0;padding:0;background:${BRAND.dark};color:${BRAND.text};direction:rtl;">
  <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="width:100%;background:${BRAND.dark};padding:28px 12px 36px;">
    <tr><td align="center">
      <table role="presentation" class="email-shell" width="100%" cellspacing="0" cellpadding="0" border="0" style="max-width:620px;width:100%;background:#ffffff;border:1px solid ${BRAND.darkBorder};border-radius:22px;overflow:hidden;">
        <tr>
          <td align="center" style="padding:24px 20px 22px;background:${BRAND.dark};border-bottom:3px solid ${BRAND.orange};">
            <table role="presentation" cellspacing="0" cellpadding="0" border="0" align="center">
              <tr>
                <td valign="middle" style="padding-left:12px;">
                  <img src="${escapeHtml(BRAND_LOGO_URL)}" width="48" height="48" alt="شعار TELC Voll" style="display:block;width:48px;height:48px;border:0;border-radius:13px;" />
                </td>
                <td valign="middle" align="right">
                  <div class="brand-name" style="color:#ffffff;font-size:25px;font-weight:900;letter-spacing:-.4px;line-height:1.2;">TELC <span style="color:${BRAND.orange};">Voll</span></div>
                  <div class="brand-tagline" style="color:#a7b5ae;font-size:11px;line-height:1.5;margin-top:5px;">منصة التحضير لامتحانات اللغة الألمانية · B1 · B2 · C1</div>
                </td>
              </tr>
            </table>
          </td>
        </tr>
        <tr>
          <td class="mobile-padding" dir="rtl" style="padding:${contentPadding};">
            ${safeContent}
          </td>
        </tr>
        <tr>
          <td align="center" style="padding:18px 20px;background:${BRAND.soft};border-top:1px solid ${BRAND.line};color:${BRAND.muted};font-size:11px;line-height:1.8;">
            <strong style="color:${BRAND.text};">TELC Voll</strong><br />
            منصة التحضير لامتحانات اللغة الألمانية · B1 · B2 · C1<br />
            <a href="${escapeHtml(CLEAN_SITE_URL)}" target="_blank" style="color:${BRAND.orangeDark};text-decoration:none;font-weight:800;">${escapeHtml(CLEAN_SITE_URL)}</a>
          </td>
        </tr>
      </table>
    </td></tr>
  </table>
</body>
</html>`;
}

/** Send a branded subscription activation notice after confirmed payment. */
async function sendSubscriptionActivatedEmail({ to, name, planName, durationDays, expiresAt }) {
  const safeName = escapeHtml(name || 'عزيزي المشترك');
  const safePlan = escapeHtml(planName || 'اشتراك TELC Voll');
  const safeDays = escapeHtml(durationDays || '—');
  let formattedDate = `${safeDays} يومًا`;
  if (expiresAt) {
    const date = new Date(expiresAt);
    if (!Number.isNaN(date.getTime())) {
      formattedDate = new Intl.DateTimeFormat('ar-DZ', {
        year: 'numeric', month: 'long', day: 'numeric', timeZone: 'Africa/Algiers'
      }).format(date);
    }
  }
  const safeExpiry = escapeHtml(formattedDate);
  const subject = 'تم تفعيل اشتراكك في TELC Voll — أهلاً بك';

  const content = `
    <div style="display:inline-block;padding:7px 13px;border:1px solid #bfe8ce;border-radius:999px;background:#effaf3;color:${BRAND.green};font-size:12px;font-weight:800;margin-bottom:16px;">✓ تم تأكيد الدفع وتفعيل الحساب</div>
    <h1 style="margin:0 0 12px;color:#111a15;font-size:25px;line-height:1.5;font-weight:900;">مرحبًا ${safeName}، أهلًا بك في المنصة</h1>
    <p style="margin:0 0 22px;color:#53635b;font-size:15px;line-height:1.95;">شكرًا لانضمامك إلى TELC Voll. تم تفعيل حسابك واشتراكك بنجاح. نتمنى لك تدريبًا ممتعًا ونجاحًا وتوفيقًا في امتحانك القادم.</p>
    <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="background:${BRAND.soft};border:1px solid ${BRAND.line};border-radius:16px;margin:0 0 22px;">
      <tr><td style="padding:10px 19px;">
        <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0">
          <tr><td align="right" style="padding:12px 0;border-bottom:1px dashed #d8e2dc;color:${BRAND.muted};font-size:13px;">الخطة</td><td align="left" style="padding:12px 0;border-bottom:1px dashed #d8e2dc;color:#18221d;font-size:14px;font-weight:800;">${safePlan}</td></tr>
          <tr><td align="right" style="padding:12px 0;border-bottom:1px dashed #d8e2dc;color:${BRAND.muted};font-size:13px;">المدة</td><td align="left" style="padding:12px 0;border-bottom:1px dashed #d8e2dc;color:#18221d;font-size:14px;font-weight:800;">${safeDays} يومًا</td></tr>
          <tr><td align="right" style="padding:12px 0;border-bottom:1px dashed #d8e2dc;color:${BRAND.muted};font-size:13px;">نطاق الوصول</td><td align="left" style="padding:12px 0;border-bottom:1px dashed #d8e2dc;color:${BRAND.green};font-size:14px;font-weight:900;">B1 · B2 · C1</td></tr>
          <tr><td align="right" style="padding:12px 0 5px;color:${BRAND.muted};font-size:13px;">تاريخ انتهاء الاشتراك</td><td align="left" style="padding:12px 0 5px;color:${BRAND.orangeDark};font-size:14px;font-weight:900;">${safeExpiry}</td></tr>
        </table>
      </td></tr>
    </table>
    <table role="presentation" cellspacing="0" cellpadding="0" border="0" align="center" style="margin:0 auto 20px;"><tr><td align="center" style="background:${BRAND.orange};border-radius:13px;">
      <a href="${escapeHtml(CLEAN_SITE_URL)}/login.html" target="_blank" style="display:inline-block;padding:14px 30px;color:#ffffff;text-decoration:none;font-size:15px;font-weight:900;">الدخول إلى المنصة ←</a>
    </td></tr></table>
    <p style="margin:0;color:${BRAND.muted};font-size:12px;line-height:1.8;text-align:center;">إذا احتجت إلى أي مساعدة، يسعدنا تواصلك معنا عبر <a href="${escapeHtml(CLEAN_SITE_URL)}/contact.html" target="_blank" style="color:${BRAND.orangeDark};font-weight:800;text-decoration:none;">صفحة الدعم</a>.</p>
  `;

  return sendEmail({ to, subject, html: wrapBrandedEmail(content, subject) });
}

/** Send password reset link email. */
async function sendPasswordResetEmail({ to, name, resetUrl, expiresMinutes = 60 }) {
  const safeName = escapeHtml(name || 'عزيزي الطالب');
  const safeUrl = escapeHtml(resetUrl || `${CLEAN_SITE_URL}/reset-password.html`);
  const subject = 'إعادة تعيين كلمة المرور — منصة TELC Voll';

  const content = `
    <h2 style="font-size:22px;color:${BRAND.dark};margin:0 0 16px;font-weight:800;">إعادة تعيين كلمة المرور</h2>
    <p style="font-size:15px;color:#43544c;line-height:1.8;margin:0 0 20px;">مرحباً <strong>${safeName}</strong>،<br />تلقينا طلباً لإعادة تعيين كلمة المرور الخاصة بحسابك في منصة TELC Voll. يمكنك إنشاء كلمة مرور جديدة بالضغط على الزر أدناه:</p>
    <div style="text-align:center;margin:30px 0;">
      <a href="${safeUrl}" target="_blank" style="display:inline-block;background:${BRAND.orange};color:#ffffff;text-decoration:none;font-size:16px;font-weight:800;padding:14px 34px;border-radius:12px;">تعيين كلمة مرور جديدة ←</a>
    </div>
    <p style="font-size:13px;color:#83978f;line-height:1.6;margin:24px 0 0;border-top:1px solid #eef2f0;padding-top:16px;">⏱ هذا الرابط صالح لمدة <strong>${escapeHtml(expiresMinutes)} دقيقة</strong> فقط، ويمكن استخدامه لمرة واحدة.<br />إذا لم تطلب إعادة تعيين كلمة المرور، يمكنك تجاهل هذه الرسالة بأمان.</p>
  `;

  return sendEmail({ to, subject, html: wrapBrandedEmail(content, subject) });
}

/** Send email verification link. */
async function sendVerificationEmail({ to, name, verificationUrl, expiresHours = 24 }) {
  const safeName = escapeHtml(name || 'عزيزي الطالب');
  const safeUrl = escapeHtml(verificationUrl || `${CLEAN_SITE_URL}/verify-email.html`);
  const subject = 'تفعيل حسابك في منصة TELC Voll — رابط التحقق من البريد';

  const content = `
    <h2 style="font-size:22px;color:${BRAND.dark};margin:0 0 14px;font-weight:900;">تأكيد البريد الإلكتروني وتفعيل الحساب</h2>
    <p style="font-size:15px;color:#43544c;line-height:1.8;margin:0 0 20px;">مرحباً <strong>${safeName}</strong>،<br />شكراً لتسجيلك في منصة <strong>TELC Voll</strong> للتحضير لامتحانات اللغة الألمانية. يرجى الضغط على الزر أدناه لتأكيد بريدك الإلكتروني وتفعيل حسابك:</p>
    <div style="text-align:center;margin:30px 0;">
      <a href="${safeUrl}" target="_blank" style="display:inline-block;background:${BRAND.orange};color:#ffffff;text-decoration:none;font-size:16px;font-weight:900;padding:15px 36px;border-radius:12px;">تأكيد بريدي وتفعيل الحساب ←</a>
    </div>
    <p style="font-size:13px;color:#83978f;line-height:1.6;margin:24px 0 0;border-top:1px solid #eef2f0;padding-top:16px;">⏱ هذا الرابط صالح لمدة <strong>${escapeHtml(expiresHours)} ساعة</strong>.<br />إذا لم تكن أنت من أنشأ الحساب، يمكنك تجاهل هذا البريد بأمان.</p>
  `;

  return sendEmail({ to, subject, html: wrapBrandedEmail(content, subject) });
}

module.exports = {
  sendEmail,
  sendSubscriptionActivatedEmail,
  sendPasswordResetEmail,
  sendVerificationEmail,
  wrapBrandedEmail,
  escapeHtml,
  BRAND,
  BRAND_LOGO_URL,
  SITE_URL: CLEAN_SITE_URL,
};
