# TELC Platform — نسخة Netlify (Node.js + Postgres)

هذه نسخة معاد بناؤها بالكامل من مشروع PHP الأصلي لتعمل على **Netlify**:
- الواجهة: صفحات HTML/CSS/JS ثابتة في مجلد `public/`
- الخلفية: **Netlify Functions** (Node.js) في `netlify/functions/`
- قاعدة البيانات: **Postgres** بدل MySQL (متوافقة مع Supabase أو Neon، وكلاهما لديه خطة مجانية)

Netlify لا يشغّل PHP ولا MySQL مباشرة، لذلك تم استبدال:
| الأصلي (PHP) | البديل (Netlify) |
|---|---|
| جلسات PHP (`$_SESSION`) | كوكيز JWT موقّعة (httpOnly) |
| PDO / MySQL | مكتبة `pg` / Postgres |
| `install.php` مع قفل ملف | دالة `install` محمية بـ `SETUP_KEY` وقفل عبر جدول `settings` |
| CSRF token يدوي | نفس الحماية تُغطّى تلقائيًا عبر SameSite cookies + طلبات JSON من نفس الأصل (راجع ملاحظة الأمان أدناه) |

---

## 1) إنشاء قاعدة بيانات Postgres مجانية (Supabase مثال)

1. أنشئ حسابًا على https://supabase.com وأنشئ مشروعًا جديدًا (مجاني).
2. من القائمة الجانبية: **SQL Editor** → **New query**.
3. الصق محتوى ملف `database/schema.sql` كاملًا واضغط **Run**.
4. من **Project Settings → Database**، انسخ **Connection string** (وضع URI، مع كلمة المرور). سيكون شكله:
   ```
   postgresql://postgres:[YOUR-PASSWORD]@db.xxxx.supabase.co:5432/postgres
   ```
   هذا هو `DATABASE_URL`.

> بديل: Neon (https://neon.tech) يعمل بنفس الطريقة تمامًا — أنشئ مشروعًا، شغّل نفس `schema.sql`، وانسخ رابط الاتصال.

---

## 2) رفع المشروع على Netlify

### الطريقة الأسهل — سحب وإفلات
1. اذهب إلى https://app.netlify.com → **Add new site → Deploy manually**.
2. اسحب مجلد المشروع بالكامل (بعد فك الضغط) إلى الصفحة.

⚠️ لكن هذه الطريقة **لا تُثبّت حزم npm** (`pg`, `jsonwebtoken`, إلخ)، والدوال تحتاجها. لذلك يُفضّل الطريقة التالية.

### الطريقة الموصى بها — عبر GitHub
1. ارفع محتوى هذا المجلد إلى مستودع GitHub جديد.
2. في Netlify: **Add new site → Import an existing project** → اختر المستودع.
3. إعدادات البناء ستُقرأ تلقائيًا من `netlify.toml` (موجود بالفعل):
   - Build command: `npm install`
   - Publish directory: `public`
   - Functions directory: `netlify/functions`
4. اضغط **Deploy**.

---

## 3) إضافة متغيرات البيئة

في Netlify: **Site settings → Environment variables**، أضف (انظر `.env.example` للتفاصيل):

| المتغير | القيمة |
|---|---|
| `DATABASE_URL` | رابط الاتصال من Supabase/Neon |
| `JWT_SECRET` | نص عشوائي طويل (ولّده بالأمر أدناه) |
| `SETUP_KEY` | كلمة سر مؤقتة لحماية صفحة التثبيت |
| `ADMIN_EMAIL` | بريد الأدمن الافتراضي |
| `ADMIN_PASSWORD` | كلمة مرور الأدمن الافتراضية (8 أحرف فأكثر) |
| `AI_API_URL` / `AI_API_KEY` / `AI_MODEL` | اختياري — لتفعيل صفحة "Sprechen AI" |

لتوليد `JWT_SECRET` عشوائي، شغّل محليًا (يحتاج Node.js):
```bash
node -e "console.log(require('crypto').randomBytes(48).toString('hex'))"
```

بعد إضافة المتغيرات، اذهب إلى **Deploys → Trigger deploy → Deploy site** لإعادة النشر بها.

---

## 4) تشغيل التثبيت الأول (إنشاء حساب الأدمن)

1. افتح `https://your-site.netlify.app/install.html`
2. أدخل نفس قيمة `SETUP_KEY`، وبريد وكلمة مرور الأدمن.
3. اضغط **Installieren**. سيُنشأ حساب الأدمن ويُقفل التثبيت تلقائيًا (عبر صف `installed=1` في جدول `settings`).
4. **مهم:** بعد نجاح التثبيت، احذف متغيّر `SETUP_KEY` من إعدادات Netlify أو غيّره، حتى لا يبقى أحد قادرًا على محاولة إعادة استخدامه.

بعدها سجّل الدخول من `https://your-site.netlify.app/admin/login.html`.

---

## 5) ملف الطالب عند أول دخول

عند استخدام رمز وصول لأول مرة، يُنشأ حساب الطالب تلقائياً. قبل فتح محتوى المنصة يُطلب منه إكمال ملفه مرة واحدة: الاسم، اللقب، البريد الإلكتروني، ورقم الهاتف والبلد بشكل اختياري. الكود الواحد يمنح الوصول إلى **B1 وB2 وC1**؛ المستوى لا يُختار أثناء التسجيل. بعد الحفظ يمكن تعديل البيانات لاحقاً من رابط **ملفي / Mein Profil**.

إذا كانت قاعدة البيانات موجودة مسبقاً، شغّل مرة واحدة الملف `database/migration-20260918-student-profiles.sql` في Supabase SQL Editor.

## 6) الاستخدام

- **الطلاب** يدخلون من الصفحة الرئيسية `/` برمز وصول (Access Code) تنشئه أنت من لوحة الأدمن (**Codes & Plans**).
- **الأدمن** يدير كل شيء من `/admin/index.html`: الخطط والأكواد، بناء الأسئلة والتمارين، بناء محاكاة الامتحان، الطلاب، الملخصات، الإعدادات، الإحصائيات.

---

## ملاحظات أمان مهمة

- الكوكيز مضبوطة كـ `httpOnly` + `Secure` + `SameSite=Lax`، وتعمل تلقائيًا فقط عبر HTTPS الذي يوفره Netlify افتراضيًا.
- تحديد معدل الطلبات (rate limiting) للدخول ولاستخدام الذكاء الاصطناعي منقول بالكامل عبر جدول `rate_limits` في Postgres، بنفس أرقام النسخة الأصلية.
- لا يُحفظ مفتاح AI في أي كود يصل للمتصفح؛ يبقى فقط داخل دالة `ai-proxy` على الخادم.
- إن أردت طبقة CSRF إضافية صريحة (كما في PHP الأصلي)، يمكن إضافتها لاحقًا كتوكن يُرسَل ضمن رأس مخصص والتحقق منه في كل دالة POST — النسخة الحالية تعتمد على أن الطلبات تأتي فقط من نفس الموقع (same-origin) عبر `fetch` بصيغة JSON، وهو ما تمنعه المتصفحات تلقائيًا من مواقع خارجية بدون إعدادات CORS صريحة (وهي غير مفعّلة هنا).
- لرفع ملفات صوتية (audio_url) تحتاج تخزينًا خارجيًا (مثل Supabase Storage أو Cloudinary) لأن Netlify لا يوفر تخزين ملفات دائم مثل مجلد `storage/` في PHP — ضع الرابط المباشر للملف في حقل `audio_url` عند إنشاء التمرين.

---

## هيكل المشروع

```
├── netlify.toml              # إعدادات Netlify (النشر + إعادة التوجيه لـ /api/*)
├── package.json              # اعتماديات Node.js
├── database/schema.sql       # مخطط Postgres (شغّله مرة واحدة في Supabase/Neon)
├── .env.example               # أسماء متغيرات البيئة المطلوبة
├── netlify/functions/         # كل المنطق الخلفي (بديل ملفات PHP)
│   ├── _lib/                  # أدوات مشتركة: db, auth, guard, ratelimit
│   ├── auth-login.js / auth-logout.js / me.js
│   ├── exercise-get.js / exercise-submit.js / exam-get.js
│   ├── errors-list.js / ai-proxy.js
│   ├── admin-login.js / admin-logout.js / admin-stats.js
│   ├── admin-codes.js / admin-questions.js / admin-exams.js
│   ├── admin-students.js / admin-settings.js
│   ├── admin-statistics.js / install.js
└── public/                    # كل صفحات الواجهة (بديل ملفات PHP الأمامية)
    ├── index.html, dashboard.html, exercise.html, exam.html
    ├── errors.html, speaking.html, install.html
    ├── assets/app.css, assets/app.js
    └── admin/ (login, index, codes, questions, exams, students, settings, statistics).html
```


## AI Schreiben
Set Netlify environment variables `GEMINI_API_KEY` and/or `GROQ_API_KEY`. Optional model variables: `GEMINI_WRITING_MODEL` (default `gemini-2.5-flash`) and `GROQ_WRITING_MODEL` (default `openai/gpt-oss-120b`). The Schreiben exercise includes an AI training correction endpoint at `/api/ai-writing-correct`; Gemini is primary and Groq is automatic fallback.


## Security hardening in this release
- Admin authentication uses the bcrypt password stored in `admins`; the environment password is only a bootstrap fallback when no admin row exists.
- Admin session lifetime is reduced to 4 hours and authentication cookies use `HttpOnly`, `Secure`, `SameSite=Strict`.
- Mutating API requests reject an explicitly cross-origin `Origin` header and enforce a request-size limit.
- API responses use `Cache-Control: no-store` and additional browser security headers.
- Database DDL is kept out of normal student request paths; run `database/schema.sql` once during deployment.
- Submission endpoints have per-student rate limits and server errors no longer expose raw database/provider messages to the browser.

### Important
The automatic exercise-state/progress persistence system requested to be excluded is not added by this release. Existing functionality from the V6 base is otherwise preserved.
