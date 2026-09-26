// TELC Voll — Resend Email Integration Service
// Server-side only: never expose RESEND_API_KEY to client or public files.

const RESEND_API_URL = 'https://api.resend.com/emails';
const DEFAULT_SENDER = process.env.EMAIL_FROM || 'TELC Voll <noreply@telcvoll.de>';
const SITE_URL = process.env.SITE_URL || 'https://telcvoll.de';
const BRAND_LOGO_URL = `${SITE_URL.replace(/\/+$/, '')}/assets/TELC_Voll_AppIcon_Light.png`;

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

/** Send a branded subscription activation notice after confirmed payment. */
async function sendSubscriptionActivatedEmail({ to, name, planName, durationDays, expiresAt }) {
  const safeName = escapeHtml(name || 'عزيزي المشترك');
  const safePlan = escapeHtml(planName || 'اشتراك TELC Voll');
  const safeDays = escapeHtml(durationDays || '—');
  const siteUrl = escapeHtml(SITE_URL.replace(/\/+$/, ''));
  const logoUrl = escapeHtml(BRAND_LOGO_URL);
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

  const html = `<!doctype html>
<html lang="ar" dir="rtl" xmlns="http://www.w3.org/1999/xhtml">
<head>
  <meta http-equiv="Content-Type" content="text/html; charset=UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <meta name="color-scheme" content="light" />
  <title>${escapeHtml(subject)}</title>
</head>
<body style="margin:0;padding:0;background:#0d1310;font-family:'Segoe UI',Tahoma,Arial,sans-serif;color:#17221d;direction:rtl;">
  <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="background:#0d1310;padding:30px 12px;">
    <tr><td align="center">
      <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="max-width:620px;background:#ffffff;border:1px solid #26332d;border-radius:22px;overflow:hidden;">
        <tr><td align="center" style="padding:28px 20px 24px;background:#101713;border-bottom:3px solid #f47b20;">
          <table role="presentation" cellspacing="0" cellpadding="0" border="0"><tr>
            <td valign="middle" style="padding-left:12px;"><img src="${logoUrl}" width="48" height="48" alt="شعار TELC Voll" style="display:block;width:48px;height:48px;border:0;border-radius:13px;" /></td>
            <td valign="middle" align="right"><div style="color:#ffffff;font-size:25px;font-weight:900;letter-spacing:-.4px;">TELC <span style="color:#f47b20;">Voll</span></div><div style="color:#a7b5ae;font-size:12px;margin-top:4px;">منصة التحضير لامتحانات اللغة الألمانية · B1 · B2 · C1</div></td>
          </tr></table>
        </td></tr>
        <tr><td align="right" dir="rtl" style="padding:32px 32px 28px;">
          <div style="display:inline-block;padding:7px 13px;border:1px solid #bfe8ce;border-radius:999px;background:#effaf3;color:#168348;font-size:12px;font-weight:800;margin-bottom:16px;">✓ تم تأكيد الدفع وتفعيل الحساب</div>
          <h1 style="margin:0 0 12px;color:#111a15;font-size:25px;line-height:1.5;font-weight:900;">مرحبًا ${safeName}، أهلًا بك في المنصة</h1>
          <p style="margin:0 0 22px;color:#53635b;font-size:15px;line-height:1.95;">شكرًا لانضمامك إلى TELC Voll. تم تفعيل حسابك واشتراكك بنجاح. نتمنى لك تدريبًا ممتعًا ونجاحًا وتوفيقًا في امتحانك القادم.</p>
          <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="background:#f6f9f7;border:1px solid #e1e9e4;border-radius:16px;margin:0 0 22px;">
            <tr><td style="padding:10px 19px;">
              <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0">
                <tr><td align="right" style="padding:12px 0;border-bottom:1px dashed #d8e2dc;color:#75847c;font-size:13px;">الخطة</td><td align="left" style="padding:12px 0;border-bottom:1px dashed #d8e2dc;color:#18221d;font-size:14px;font-weight:800;">${safePlan}</td></tr>
                <tr><td align="right" style="padding:12px 0;border-bottom:1px dashed #d8e2dc;color:#75847c;font-size:13px;">المدة</td><td align="left" style="padding:12px 0;border-bottom:1px dashed #d8e2dc;color:#18221d;font-size:14px;font-weight:800;">${safeDays} يومًا</td></tr>
                <tr><td align="right" style="padding:12px 0;border-bottom:1px dashed #d8e2dc;color:#75847c;font-size:13px;">نطاق الوصول</td><td align="left" style="padding:12px 0;border-bottom:1px dashed #d8e2dc;color:#168348;font-size:14px;font-weight:900;">B1 · B2 · C1</td></tr>
                <tr><td align="right" style="padding:12px 0 5px;color:#75847c;font-size:13px;">تاريخ انتهاء الاشتراك</td><td align="left" style="padding:12px 0 5px;color:#f47b20;font-size:14px;font-weight:900;">${safeExpiry}</td></tr>
              </table>
            </td></tr>
          </table>
          <table role="presentation" cellspacing="0" cellpadding="0" border="0" align="center" style="margin:0 auto 20px;"><tr><td align="center" style="background:#f47b20;border-radius:13px;box-shadow:0 7px 18px rgba(244,123,32,.22);">
            <a href="${siteUrl}/login.html" target="_blank" style="display:inline-block;padding:14px 30px;color:#ffffff;text-decoration:none;font-size:15px;font-weight:900;">الدخول إلى المنصة ←</a>
          </td></tr></table>
          <p style="margin:0;color:#75847c;font-size:12px;line-height:1.8;text-align:center;">إذا احتجت إلى أي مساعدة، يسعدنا تواصلك معنا عبر <a href="${siteUrl}/contact.html" target="_blank" style="color:#e96e17;font-weight:800;text-decoration:none;">صفحة الدعم</a>.</p>
        </td></tr>
        <tr><td align="center" style="padding:18px 20px;background:#f6f9f7;border-top:1px solid #e3eae6;color:#7a8981;font-size:11px;line-height:1.8;">TELC Voll · نتمنى لك كل النجاح<br /><a href="${siteUrl}" target="_blank" style="color:#e96e17;text-decoration:none;font-weight:700;">${siteUrl}</a></td></tr>
      </table>
    </td></tr>
  </table>
</body>
</html>`;

  return sendEmail({ to, subject, html });
}

/**
 * Send password reset link email
 */
async function sendPasswordResetEmail({ to, name, resetUrl, expiresMinutes = 60 }) {
  const safeName = escapeHtml(name || 'عزيزي الطالب');
  const safeUrl = escapeHtml(resetUrl || `${SITE_URL}/reset-password.html`);
  const subject = 'إعادة تعيين كلمة المرور — منصة TELC Voll';

  const html = `<!DOCTYPE html PUBLIC "-//W3C//DTD XHTML 1.0 Transitional//EN" "http://www.w3.org/TR/xhtml1/DTD/xhtml1-transitional.dtd">
<html xmlns="http://www.w3.org/1999/xhtml" lang="ar" dir="rtl">
<head>
  <meta http-equiv="Content-Type" content="text/html; charset=UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>${escapeHtml(subject)}</title>
  <style type="text/css">
    body { margin: 0; padding: 0; width: 100% !important; background-color: #0b0f0e; font-family: 'Segoe UI', Tahoma, Arial, sans-serif; direction: rtl; text-align: right; }
    @media only screen and (max-width: 620px) {
      .email-shell { width: 100% !important; }
      .mobile-padding { padding-left: 18px !important; padding-right: 18px !important; }
    }
  </style>
</head>
<body style="margin: 0; padding: 0; background-color: #0b0f0e; color: #151d19;">
  <table role="presentation" border="0" cellpadding="0" cellspacing="0" width="100%" style="background-color: #0b0f0e; padding: 24px 0 36px 0;">
    <tr>
      <td align="center">
        <table role="presentation" border="0" cellpadding="0" cellspacing="0" width="100%" class="email-shell" style="max-width: 600px; margin: 0 auto; background-color: #ffffff; border-radius: 20px; overflow: hidden; box-shadow: 0 16px 40px rgba(0,0,0,0.3); border: 1px solid #1f2a24;">
          <tr>
            <td align="center" style="background-color: #0b0f0e; padding: 32px 24px; border-bottom: 2px solid #ff7a00;">
              <img src="${escapeHtml(BRAND_LOGO_URL)}" width="42" height="42" alt="شعار TELC Voll" style="display:inline-block;width:42px;height:42px;border:0;border-radius:11px;vertical-align:middle;margin-left:10px;" />
              <span style="display: inline-block; width: 12px; height: 12px; background-color: #ff7a00; border-radius: 50%; margin-inline-end: 8px; vertical-align: middle;"></span>
              <span style="color: #ffffff; font-size: 26px; font-weight: 900; vertical-align: middle;">TELC Voll</span>
            </td>
          </tr>
          <tr>
            <td style="padding: 32px 32px 24px;" class="mobile-padding">
              <h2 style="font-size: 22px; color: #0b0f0e; margin: 0 0 16px 0; font-weight: 800;">إعادة تعيين كلمة المرور</h2>
              <p style="font-size: 15px; color: #43544c; line-height: 1.8; margin: 0 0 20px 0;">
                مرحباً <strong>${safeName}</strong>،<br />
                تلقينا طلباً لإعادة تعيين كلمة المرور الخاصة بحسابك في منصة TELC Voll. يمكنك إنشاء كلمة مرور جديدة بالضغط على الزر أدناه:
              </p>
              <div style="text-align: center; margin: 30px 0;">
                <a href="${safeUrl}" target="_blank" style="display: inline-block; background: linear-gradient(135deg, #ff7a00 0%, #e06800 100%); color: #ffffff; text-decoration: none; font-size: 16px; font-weight: 800; padding: 14px 34px; border-radius: 12px; box-shadow: 0 6px 16px rgba(255,122,0,0.35);">
                  تعيين كلمة مرور جديدة ←
                </a>
              </div>
              <p style="font-size: 13px; color: #83978f; line-height: 1.6; margin: 24px 0 0 0; border-top: 1px solid #eef2f0; padding-top: 16px;">
                ⏱ هذا الرابط صالح لمدة <strong>${expiresMinutes} دقيقة</strong> فقط، ويمكن استخدامه لمرة واحدة.<br />
                إذا لم تطلب إعادة تعيين كلمة المرور، يمكنك تجاهل هذه الرسالة بأمان.
              </p>
            </td>
          </tr>
          <tr>
            <td style="background-color: #f7faf8; padding: 20px 32px; border-top: 1px solid #eef2f0; text-align: center;">
              <span style="color: #83978f; font-size: 12px;">TELC Voll — German Exam Preparation Platform · <a href="${SITE_URL}" target="_blank" style="color: #ff7a00; text-decoration: none;">${SITE_URL}</a></span>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>`;

  return sendEmail({ to, subject, html });
}

/**
 * Send email verification link
 */
async function sendVerificationEmail({ to, name, verificationUrl, expiresHours = 24 }) {
  const safeName = escapeHtml(name || 'عزيزي الطالب');
  const safeUrl = escapeHtml(verificationUrl || `${SITE_URL}/verify-email.html`);
  const subject = 'تفعيل حسابك في منصة TELC Voll — رابط التحقق من البريد';

  const html = `<!DOCTYPE html PUBLIC "-//W3C//DTD XHTML 1.0 Transitional//EN" "http://www.w3.org/TR/xhtml1/DTD/xhtml1-transitional.dtd">
<html xmlns="http://www.w3.org/1999/xhtml" lang="ar" dir="rtl">
<head>
  <meta http-equiv="Content-Type" content="text/html; charset=UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>${escapeHtml(subject)}</title>
  <style type="text/css">
    body { margin: 0; padding: 0; width: 100% !important; background-color: #0b0f0e; font-family: 'Segoe UI', Tahoma, Arial, sans-serif; direction: rtl; text-align: right; }
    @media only screen and (max-width: 620px) {
      .email-shell { width: 100% !important; }
      .mobile-padding { padding-left: 18px !important; padding-right: 18px !important; }
    }
  </style>
</head>
<body style="margin: 0; padding: 0; background-color: #0b0f0e; color: #151d19;">
  <table role="presentation" border="0" cellpadding="0" cellspacing="0" width="100%" style="background-color: #0b0f0e; padding: 24px 0 36px 0;">
    <tr>
      <td align="center">
        <table role="presentation" border="0" cellpadding="0" cellspacing="0" width="100%" class="email-shell" style="max-width: 600px; margin: 0 auto; background-color: #ffffff; border-radius: 20px; overflow: hidden; box-shadow: 0 16px 40px rgba(0,0,0,0.3); border: 1px solid #1f2a24;">
          <tr>
            <td align="center" style="background-color: #0b0f0e; padding: 32px 24px; border-bottom: 2px solid #ff7a00;">
              <img src="${escapeHtml(BRAND_LOGO_URL)}" width="42" height="42" alt="شعار TELC Voll" style="display:inline-block;width:42px;height:42px;border:0;border-radius:11px;vertical-align:middle;margin-left:10px;" />
              <span style="display: inline-block; width: 12px; height: 12px; background-color: #ff7a00; border-radius: 50%; margin-inline-end: 8px; vertical-align: middle;"></span>
              <span style="color: #ffffff; font-size: 26px; font-weight: 900; vertical-align: middle;">TELC Voll</span>
            </td>
          </tr>
          <tr>
            <td style="padding: 34px 32px 26px;" class="mobile-padding">
              <h2 style="font-size: 22px; color: #0b0f0e; margin: 0 0 14px 0; font-weight: 900;">تأكيد البريد الإلكتروني وتفعيل الحساب</h2>
              <p style="font-size: 15px; color: #43544c; line-height: 1.8; margin: 0 0 20px 0;">
                مرحباً <strong>${safeName}</strong>،<br />
                شكراً لتسجيلك في منصة <strong>TELC Voll</strong> للتحضير لامتحانات اللغة الألمانية. يرجى الضغط على الزر أدناه لتأكيد بريدك الإلكتروني وتفعيل حسابك:
              </p>
              <div style="text-align: center; margin: 30px 0;">
                <a href="${safeUrl}" target="_blank" style="display: inline-block; background: linear-gradient(135deg, #ff7a00 0%, #e06800 100%); color: #ffffff; text-decoration: none; font-size: 16px; font-weight: 900; padding: 15px 36px; border-radius: 12px; box-shadow: 0 6px 18px rgba(255,122,0,0.35);">
                  تأكيد بريدي وتفعيل الحساب ←
                </a>
              </div>
              <p style="font-size: 13px; color: #83978f; line-height: 1.6; margin: 24px 0 0 0; border-top: 1px solid #eef2f0; padding-top: 16px;">
                ⏱ هذا الرابط صالح لمدة <strong>${expiresHours} ساعة</strong>.<br />
                إذا لم تكن أنت من أنشأ الحساب، يمكنك تجاهل هذا البريد بأمان.
              </p>
            </td>
          </tr>
          <tr>
            <td style="background-color: #f7faf8; padding: 20px 32px; border-top: 1px solid #eef2f0; text-align: center;">
              <span style="color: #83978f; font-size: 12px;">TELC Voll — German Exam Preparation Platform · <a href="${SITE_URL}" target="_blank" style="color: #ff7a00; text-decoration: none;">${SITE_URL}</a></span>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
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
  sendSubscriptionActivatedEmail,
  sendPasswordResetEmail,
  sendVerificationEmail,
};

