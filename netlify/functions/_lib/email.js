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

  const safeName = escapeHtml(name || 'عزيزي المشترك');
  const safePlan = escapeHtml(planName || 'الخطة المختارة');
  const safeDays = escapeHtml(durationDays || '—');
  const safeCode = escapeHtml(accessCode || '');
  const subject = `رمز الدخول إلى منصة TELC Voll — كود تفعيل B1 · B2 · C1 (${safeCode})`;
  const codeLink = `${SITE_URL}/?code=${encodeURIComponent(accessCode || '')}`;

  const html = `<!DOCTYPE html PUBLIC "-//W3C//DTD XHTML 1.0 Transitional//EN" "http://www.w3.org/TR/xhtml1/DTD/xhtml1-transitional.dtd">
<html xmlns="http://www.w3.org/1999/xhtml" lang="ar" dir="rtl">
<head>
  <meta http-equiv="Content-Type" content="text/html; charset=UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <meta name="color-scheme" content="light dark" />
  <meta name="supported-color-schemes" content="light dark" />
  <title>${escapeHtml(subject)}</title>
  <style type="text/css">
    body, table, td, a { -webkit-text-size-adjust: 100%; -ms-text-size-adjust: 100%; }
    table, td { mso-table-lspace: 0pt; mso-table-rspace: 0pt; }
    img { -ms-interpolation-mode: bicubic; border: 0; outline: none; text-decoration: none; }
    body { margin: 0; padding: 0; width: 100% !important; background-color: #0b0f0e; font-family: 'Segoe UI', Tahoma, Arial, sans-serif; direction: rtl; text-align: right; }
    @media only screen and (max-width: 620px) {
      .email-shell { width: 100% !important; }
      .code-text { font-size: 24px !important; letter-spacing: 2px !important; }
      .mobile-padding { padding-left: 18px !important; padding-right: 18px !important; }
    }
  </style>
</head>
<body style="margin: 0; padding: 0; background-color: #0b0f0e; color: #151d19;">
  <table role="presentation" border="0" cellpadding="0" cellspacing="0" width="100%" style="background-color: #0b0f0e; padding: 24px 0 36px 0;">
    <tr>
      <td align="center">
        <!--[if (gte mso 9)|(IE)]>
        <table align="center" border="0" cellspacing="0" cellpadding="0" width="600">
        <tr>
        <td align="center" valign="top" width="600">
        <![endif]-->
        <table role="presentation" border="0" cellpadding="0" cellspacing="0" width="100%" class="email-shell" style="max-width: 600px; margin: 0 auto; background-color: #ffffff; border-radius: 20px; overflow: hidden; box-shadow: 0 16px 40px rgba(0,0,0,0.3); border: 1px solid #1f2a24;">
          
          <!-- Header -->
          <tr>
            <td align="center" style="background-color: #0b0f0e; padding: 34px 24px 30px; border-bottom: 2px solid #ff7a00;">
              <table role="presentation" border="0" cellpadding="0" cellspacing="0">
                <tr>
                  <td align="center" valign="middle">
                    <span style="display: inline-block; width: 12px; height: 12px; background-color: #ff7a00; border-radius: 50%; margin-inline-end: 8px; vertical-align: middle;"></span>
                    <span style="color: #ffffff; font-size: 26px; font-weight: 900; letter-spacing: -0.5px; vertical-align: middle;">TELC Voll</span>
                  </td>
                </tr>
                <tr>
                  <td align="center" style="padding-top: 6px;">
                    <span style="color: #a0b2aa; font-size: 13px; font-weight: 600; letter-spacing: 0.5px;">منصة التحضير لامتحانات اللغة الألمانية · B1 · B2 · C1</span>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- Main Content -->
          <tr>
            <td class="mobile-padding" style="padding: 34px 32px 28px; background-color: #ffffff;" dir="rtl" align="right">
              
              <!-- Success Badge -->
              <table role="presentation" border="0" cellpadding="0" cellspacing="0" style="margin-bottom: 18px;">
                <tr>
                  <td style="background-color: #fff4ec; border: 1px solid #fed7aa; border-radius: 999px; padding: 6px 16px;">
                    <span style="color: #ff7a00; font-size: 13px; font-weight: 800;">تم تأكيد الدفع بنجاح ✓</span>
                  </td>
                </tr>
              </table>

              <h1 style="color: #0b0f0e; font-size: 23px; font-weight: 900; margin: 0 0 12px 0; line-height: 1.35;">مرحباً ${safeName}</h1>
              <p style="color: #3b4d45; font-size: 15px; line-height: 1.75; margin: 0 0 24px 0;">
                شكراً لاشتراكك في منصة <strong>TELC Voll</strong>. تم تفعيل حسابك بنجاح، ورمز الدخول الخاص بك جاهز للاستخدام الفوري لجميع مستويات المنصة <strong>(B1 + B2 + C1)</strong> دون أي قيود.
              </p>

              <!-- Order Summary Table -->
              <table role="presentation" border="0" cellpadding="0" cellspacing="0" width="100%" style="background-color: #f7faf9; border: 1px solid #e1e8e5; border-radius: 16px; margin: 0 0 28px 0;">
                <tr>
                  <td style="padding: 16px 20px;">
                    <table role="presentation" border="0" cellpadding="0" cellspacing="0" width="100%">
                      <tr>
                        <td align="right" style="padding: 9px 0; border-bottom: 1px dashed #e1e8e5; color: #6b7f76; font-size: 14px;">الخطة المفعلة:</td>
                        <td align="left" dir="ltr" style="padding: 9px 0; border-bottom: 1px dashed #e1e8e5; color: #0b0f0e; font-size: 14px; font-weight: 800;">${safePlan}</td>
                      </tr>
                      <tr>
                        <td align="right" style="padding: 9px 0; border-bottom: 1px dashed #e1e8e5; color: #6b7f76; font-size: 14px;">مدة الاشتراك:</td>
                        <td align="left" style="padding: 9px 0; border-bottom: 1px dashed #e1e8e5; color: #0b0f0e; font-size: 14px; font-weight: 800;">${safeDays} يوماً</td>
                      </tr>
                      <tr>
                        <td align="right" style="padding: 9px 0; border-bottom: 1px dashed #e1e8e5; color: #6b7f76; font-size: 14px;">نطاق الوصول:</td>
                        <td align="left" style="padding: 9px 0; border-bottom: 1px dashed #e1e8e5; color: #ff7a00; font-size: 14px; font-weight: 800;">المنصة كاملة (B1 + B2 + C1)</td>
                      </tr>
                      <tr>
                        <td align="right" style="padding: 9px 0; color: #6b7f76; font-size: 14px;">تاريخ انتهاء الصلاحية:</td>
                        <td align="left" style="padding: 9px 0; color: #0b0f0e; font-size: 14px; font-weight: 800;">${escapeHtml(formattedDate)}</td>
                      </tr>
                    </table>
                  </td>
                </tr>
              </table>

              <!-- Access Code Card -->
              <table role="presentation" border="0" cellpadding="0" cellspacing="0" width="100%" style="background-color: #fff9f4; border: 2px dashed #ff7a00; border-radius: 18px; margin: 0 0 28px 0;">
                <tr>
                  <td align="center" style="padding: 26px 20px;">
                    <div style="color: #92400e; font-size: 12px; font-weight: 900; letter-spacing: 1.5px; text-transform: uppercase; margin-bottom: 8px;">
                      رمز الدخول الخاص بك · ACCESS CODE
                    </div>
                    <div class="code-text" style="font-family: Consolas, 'Courier New', monospace; font-size: 32px; font-weight: 900; color: #ff7a00; letter-spacing: 4px; padding: 6px 0; direction: ltr; display: inline-block;">
                      ${safeCode}
                    </div>
                    <div style="color: #6b7f76; font-size: 13px; line-height: 1.6; margin-top: 10px; max-width: 440px;">
                      احفظ هذا الكود. يمكنك نسخه واستخدامه للدخول في أي وقت، أو الضغط مباشرة على الزر أدناه للدخول الفوري.
                    </div>
                  </td>
                </tr>
              </table>

              <!-- Primary CTA Button -->
              <table role="presentation" border="0" cellpadding="0" cellspacing="0" width="100%" style="margin: 0 0 28px 0;">
                <tr>
                  <td align="center">
                    <a href="${escapeHtml(codeLink)}" target="_blank" style="display: inline-block; background-color: #ff7a00; color: #ffffff; text-decoration: none; font-size: 16px; font-weight: 900; padding: 16px 38px; border-radius: 14px; box-shadow: 0 6px 20px rgba(255,122,0,0.35); text-align: center;">
                      الدخول إلى المنصة وتفعيل الكود تلقائياً ←
                    </a>
                  </td>
                </tr>
              </table>

              <!-- Instructions / Steps -->
              <table role="presentation" border="0" cellpadding="0" cellspacing="0" width="100%" style="background-color: #f7faf9; border-radius: 14px; margin: 0 0 20px 0;">
                <tr>
                  <td style="padding: 18px 22px;" align="right" dir="rtl">
                    <strong style="color: #0b0f0e; font-size: 14px; display: block; margin-bottom: 8px;">خطوات تفعيل الدخول:</strong>
                    <ol style="margin: 0; padding-right: 20px; color: #3b4d45; font-size: 13px; line-height: 1.8;">
                      <li>اضغط على زر <strong>الدخول إلى المنصة</strong> أعلاه، أو توجه مباشرة إلى <a href="${SITE_URL}" target="_blank" style="color: #ff7a00; text-decoration: none; font-weight: 700;">telcvoll.de</a>.</li>
                      <li>سيتم ملء رمز الدخول تلقائياً (أو الصق الكود <strong>${safeCode}</strong> في خانة كود الدخول).</li>
                      <li>اضغط <strong>دخول إلى المنصة</strong> للبدء فوراً في جميع نماذج وامتحانات B1 و B2 و C1.</li>
                    </ol>
                  </td>
                </tr>
              </table>

              <p style="color: #83978f; font-size: 12px; text-align: center; margin: 20px 0 0 0; line-height: 1.6;">
                إذا واجهتك أي صعوبة في الدخول، يمكنك التواصل معنا مباشرة عبر صفحة <a href="${SITE_URL}/contact.html" target="_blank" style="color: #ff7a00; text-decoration: none; font-weight: 700;">تواصل معنا</a>.
              </p>

            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td align="center" style="background-color: #f7faf9; border-top: 1px solid #e1e8e5; padding: 22px 24px;">
              <table role="presentation" border="0" cellpadding="0" cellspacing="0">
                <tr>
                  <td align="center">
                    <strong style="color: #0b0f0e; font-size: 13px;">TELC Voll</strong><br />
                    <span style="color: #83978f; font-size: 12px; line-height: 1.7;">
                      German Exam Preparation Platform · B1 · B2 · C1<br />
                      <a href="${SITE_URL}" target="_blank" style="color: #ff7a00; text-decoration: none; font-weight: 600;">${SITE_URL}</a>
                    </span>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

        </table>
        <!--[if (gte mso 9)|(IE)]>
        </td>
        </tr>
        </table>
        <![endif]-->
      </td>
    </tr>
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
  sendAccessCodeEmail,
  sendPasswordResetEmail,
  sendVerificationEmail,
};

