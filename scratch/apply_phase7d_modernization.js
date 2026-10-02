const fs = require('fs');
const path = require('path');

const rootDir = path.join(__dirname, '..');
const selfTestPath = path.join(rootDir, 'public', 'self-test.html');
const selfTestResultPath = path.join(rootDir, 'public', 'self-test-result.html');

console.log('=== Applying Phase 7D Mock Exam Results & Self-Test Modernization ===\n');

/* --------------------------------------------------------------------------
   1. Modernized public/self-test.html
   -------------------------------------------------------------------------- */
const modernizedSelfTestHtml = `<!doctype html>
<html lang="ar" dir="rtl">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width,initial-scale=1,viewport-fit=cover">
<meta name="theme-color" content="#080808">
<title>الامتحان التجريبي — TELC Voll</title>
<link rel="stylesheet" href="/assets/app.css?v=20261002-mock-v7d">
<link rel="icon" href="/assets/favicon-light.svg" type="image/svg+xml" media="(prefers-color-scheme: light)">
<link rel="icon" href="/assets/favicon-dark.svg" type="image/svg+xml" media="(prefers-color-scheme: dark)">
<link rel="alternate icon" href="/assets/favicon-light.png" type="image/png" media="(prefers-color-scheme: light)">
<link rel="alternate icon" href="/assets/favicon-dark.png" type="image/png" media="(prefers-color-scheme: dark)">
<link rel="manifest" href="/manifest.webmanifest">
<style>
/* TELC Voll: unified typography */
html,html body,html body *{font-family:"Cairo","Segoe UI",Arial,sans-serif !important;}
html body h1,html body h2,html body h3,html body h4,html body h5,html body h6,html body button,html body input,html body textarea,html body select,html body label,html body a{font-family:"Cairo","Segoe UI",Arial,sans-serif !important;}
</style>
<style id="self-test-modern-shell">
/* TELC Voll — Phase 7D Self-Test Modern Shell (Quiet Luxury + Soft Glass) */
.self-test-page {
  max-width: 1100px;
  margin: 0 auto;
  padding: 32px 20px 80px;
  box-sizing: border-box;
}

/* Master Start Shell */
.self-test-shell {
  background: var(--bg-surface-elevated, var(--white)) !important;
  border: 1px solid var(--border-subtle, var(--line)) !important;
  border-radius: 28px !important;
  padding: clamp(32px, 5vw, 56px) clamp(20px, 4vw, 44px) !important;
  box-shadow: var(--shadow-card, 0 10px 36px rgba(0,0,0,0.06)) !important;
  text-align: center;
  position: relative;
  overflow: hidden;
  box-sizing: border-box;
  margin: 16px auto !important;
}

.self-test-shell .tag {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  background: var(--brand-subtle, rgba(255, 122, 47, 0.08));
  color: var(--brand-primary, #FF7A2F);
  border: 1px solid var(--brand-border, rgba(255, 122, 47, 0.28));
  padding: 6px 16px;
  border-radius: 999px;
  font-size: 13px;
  font-weight: 850;
  letter-spacing: 0.02em;
}

.self-test-shell h1 {
  font-size: clamp(28px, 4.5vw, 44px) !important;
  font-weight: 950 !important;
  color: var(--text-primary, var(--ink)) !important;
  margin: 18px 0 12px !important;
  letter-spacing: -0.02em;
  line-height: 1.25;
}

.self-test-shell p.muted {
  color: var(--text-secondary, var(--muted)) !important;
  font-size: 15.5px !important;
  line-height: 1.75 !important;
  max-width: 760px !important;
  margin: 0 auto 28px !important;
}

/* Level Switcher */
.self-levels {
  display: inline-flex !important;
  align-items: center;
  justify-content: center;
  gap: 10px !important;
  background: var(--bg-surface, var(--bg)) !important;
  border: 1.5px solid var(--border-subtle, var(--line)) !important;
  border-radius: 18px !important;
  padding: 8px !important;
  margin: 0 auto 36px !important;
  flex-wrap: wrap;
}

.self-levels .level-btn {
  min-height: 48px !important;
  min-width: 110px !important;
  border-radius: 12px !important;
  font-size: 15px !important;
  font-weight: 850 !important;
  border: 1.5px solid transparent !important;
  background: transparent !important;
  color: var(--text-secondary, var(--muted)) !important;
  cursor: pointer !important;
  transition: all 0.2s cubic-bezier(0.16, 1, 0.3, 1) !important;
  display: inline-flex !important;
  align-items: center !important;
  justify-content: center !important;
  box-sizing: border-box !important;
}

.self-levels .level-btn:hover:not(.active) {
  color: var(--text-primary, var(--ink)) !important;
  background: var(--brand-subtle, rgba(255, 122, 47, 0.08)) !important;
  border-color: transparent !important;
}

.self-levels .level-btn.active {
  background: var(--brand-primary, #FF7A2F) !important;
  color: #ffffff !important;
  border-color: var(--brand-primary, #FF7A2F) !important;
  font-weight: 950 !important;
  box-shadow: 0 4px 16px var(--brand-glow, rgba(255, 122, 47, 0.28)) !important;
  transform: scale(1.02);
}

/* Exam Rules Grid */
.self-test-grid.mock-rules {
  display: grid !important;
  grid-template-columns: repeat(3, 1fr) !important;
  gap: 18px !important;
  margin: 0 0 36px !important;
  text-align: start;
}

.mock-rules article {
  background: var(--bg-surface, var(--bg)) !important;
  border: 1.5px solid var(--border-subtle, var(--line)) !important;
  border-radius: 20px !important;
  padding: 24px !important;
  box-shadow: var(--shadow-subtle, 0 1px 3px rgba(0,0,0,0.05)) !important;
  transition: all 0.2s ease !important;
  box-sizing: border-box;
  display: flex;
  flex-direction: column;
}

.mock-rules article:hover {
  border-color: var(--brand-border, rgba(255, 122, 47, 0.3)) !important;
  transform: translateY(-2px);
}

.mock-rules .self-icon {
  width: 46px;
  height: 46px;
  border-radius: 14px;
  background: var(--brand-subtle, rgba(255, 122, 47, 0.08));
  color: var(--brand-primary, #FF7A2F);
  border: 1px solid var(--brand-border, rgba(255, 122, 47, 0.28));
  display: grid;
  place-items: center;
  font-size: 20px;
  font-weight: 900;
  margin-bottom: 16px;
}

.mock-rules h2 {
  font-size: 17.5px !important;
  font-weight: 900 !important;
  color: var(--text-primary, var(--ink)) !important;
  margin: 0 0 8px !important;
}

.mock-rules p {
  font-size: 13.5px !important;
  line-height: 1.65 !important;
  color: var(--text-secondary, var(--muted)) !important;
  margin: 0 !important;
}

/* Primary Start CTA */
.self-test-btn#startBtn {
  min-height: 52px !important;
  min-width: 260px !important;
  font-size: 16px !important;
  font-weight: 950 !important;
  border-radius: 16px !important;
  background: var(--brand-primary, #FF7A2F) !important;
  color: #ffffff !important;
  border: none !important;
  cursor: pointer !important;
  box-shadow: 0 4px 20px var(--brand-glow, rgba(255, 122, 47, 0.32)) !important;
  transition: all 0.2s cubic-bezier(0.16, 1, 0.3, 1) !important;
  display: inline-flex !important;
  align-items: center !important;
  justify-content: center !important;
  gap: 10px !important;
  margin: 10px auto 0 !important;
  text-decoration: none !important;
  padding: 0 32px !important;
}

.self-test-btn#startBtn:hover {
  background: var(--brand-hover, #FF8D47) !important;
  box-shadow: 0 6px 26px var(--brand-glow, rgba(255, 122, 47, 0.4)) !important;
  transform: translateY(-2px);
}

.self-test-btn#startBtn:active {
  background: var(--brand-active, #E5631A) !important;
  transform: translateY(0);
}

/* Responsive Reflow */
@media (max-width: 768px) {
  .self-test-page {
    padding: 16px 12px 60px;
  }
  .self-test-shell {
    padding: 28px 16px !important;
    border-radius: 20px !important;
  }
  .self-test-grid.mock-rules {
    grid-template-columns: 1fr !important;
    gap: 12px !important;
  }
  .self-levels {
    width: 100%;
    box-sizing: border-box;
  }
  .self-levels .level-btn {
    flex: 1;
    min-width: 0 !important;
    min-height: 44px !important;
  }
  .self-test-btn#startBtn {
    width: 100% !important;
    min-width: 0 !important;
  }
}
</style>
</head>
<body>
<header class="top">
  <a class="brand" href="/dashboard.html"><span class="brand-mark"><span class="brand-dot"></span>TELC Voll</span></a>
  <nav class="student-nav-links">
    <a href="/dashboard.html" data-i18n="nav_home_student">منصة الطالب</a>
    <a href="/self-test.html" class="active" data-i18n="nav_mock">امتحان تجريبي</a>
    <a href="/telc-chat.html" data-i18n="nav_speaking">مساعد TELC</a>
    <a href="/profile.html" data-i18n="profile_link">ملفي</a>
    <a href="#" id="logoutLink" data-i18n="nav_logout" class="nav-logout-btn">خروج</a>
  </nav>
  <span class="header-actions"></span>
</header>

<main class="self-test-page" id="content">
  <div class="student-loading">جارٍ التحميل…</div>
</main>

<script src="/assets/i18n.js?v=20260927-subscription-activation-mail-v10"></script>
<script src="/assets/app.js"></script>
<script>
const LEVELS=['B1','B2','C1'];
const rawLvl = String(qs('level')||'').toUpperCase();
let exercises=[],level=['B1','B2','C1'].includes(rawLvl)?rawLvl:'B2';
const txt=(a,d)=>getLang()==='ar'?a:d;
const groups={Lesen:['Teil 1','Teil 2','Teil 3'],Hören:['Teil 1','Teil 2','Teil 3'],Sprachbausteine:['Teil 1','Teil 2'],Schreiben:['Teil 1']};

function render(){
  document.getElementById('content').innerHTML=\`<section class="self-test-shell mock-start-shell">
    <span class="tag">\${txt('امتحان تجريبي','Probeprüfung')}</span>
    <h1>\${txt('اختر مستوى الامتحان','Prüfungsniveau wählen')}</h1>
    <p class="muted">\${txt('اختر B1 أو B2 أو C1 فقط. بعد البدء يختار الموقع التمارين عشوائياً من المحتوى المنشور ويبدأ مؤقت واحد للامتحان الكتابي كاملاً.','Wähle nur B1, B2 oder C1. Danach wählt die Plattform die veröffentlichten Aufgaben zufällig aus und startet eine einzige Gesamtzeit für die komplette schriftliche Simulation.')}</p>
    <div class="self-levels">\${LEVELS.map(l=>\`<button class="level-btn \${String(level).toUpperCase()===l?'active':''}" data-level="\${l}" aria-pressed="\${String(level).toUpperCase()===l?'true':'false'}">Telc \${l}</button>\`).join('')}</div>
    <div class="self-test-grid mock-rules">
      <article><span class="self-icon">↝</span><h2>\${txt('اختيار عشوائي','Zufällige Auswahl')}</h2><p>\${txt('لا تظهر قائمة بالمواضيع ولا يمكنك اختيار موضوع أو قسم.','Keine Themenliste und keine Auswahl einzelner Themen oder Bereiche.')}</p></article>
      <article><span class="self-icon">◷</span><h2>\${txt('مؤقت واحد','Ein Gesamt-Timer')}</h2><p>\${txt('مؤقت واحد للامتحان الكتابي كاملاً ويظهر دائماً في الأعلى بجانب أقسام الامتحان.','Ein einziger Timer läuft für die gesamte schriftliche Prüfung und bleibt oben neben den Prüfungsteilen sichtbar.')}</p></article>
      <article><span class="self-icon">✓</span><h2>\${txt('امتحان كتابي فقط','Nur schriftliche Prüfung')}</h2><p>\${txt('تشمل المحاكاة Lesen وHören وSprachbausteine وSchreiben فقط، ولا تشمل Sprechen.','Die Simulation umfasst nur Lesen, Hören, Sprachbausteine und Schreiben; Sprechen ist nicht enthalten.')}</p></article>
    </div>
    <button class="btn self-test-btn" id="startBtn">\${txt('بدء امتحان Telc','Telc-Prüfung starten')} ←</button>
  </section>\`;
  document.querySelectorAll('[data-level]').forEach(b=>b.onclick=()=>{level=String(b.dataset.level||'B2').toUpperCase();render();});
  document.getElementById('startBtn').onclick=start;
}

function start(){
  const picks=[];
  for(const section of Object.keys(groups)){
    for(const teil of groups[section]){
      const pool=exercises.filter(x=>(x.level||'B2')===level && x.section===section && x.teil===teil && x.status==='published');
      if(pool.length)picks.push(pool[Math.floor(Math.random()*pool.length)]);
    }
  }
  const bySection=picks.reduce((m,x)=>{(m[x.section] ||= []).push(x);return m;},{});
  const required=['Lesen','Hören','Sprachbausteine','Schreiben'];
  const missing=required.filter(s=>!bySection[s]?.length);
  if(missing.length){alert(txt('لا يمكن بدء المحاكاة: لا توجد تمارين منشورة لبعض الأقسام: '+missing.join('، '),'Die Simulation kann nicht gestartet werden. Veröffentlichten Aufgaben fehlen für: '+missing.join(', ')));return;}
  const now=Date.now();
  const session={id:crypto.randomUUID?crypto.randomUUID():Date.now().toString(36),level,startedAt:now,examDurationSeconds:8400,examEndsAt:now+8400*1000,mock:true,tasks:picks.map(x=>({id:x.id,section:x.section,teil:x.teil,title:x.title,task_type:x.task_type})),answersByExercise:{},writingByExercise:{},currentSection:'Lesen'};
  localStorage.setItem('telc_mock_exam',JSON.stringify(session));
  location.href='/mock-exam.html?session='+encodeURIComponent(session.id);
}
(async()=>{
  try {
    const d = await api('me');
    exercises = Array.isArray(d?.exercises) ? d.exercises : [];
    render();
  } catch(e) {
    console.error('Self-test init error:', e);
    if (e?.status === 401) {
      location.href = '/?error=session';
    } else {
      const contentEl = document.getElementById('content');
      if (contentEl) {
        contentEl.innerHTML = \`
          <div class="empty-panel" style="margin:50px auto;max-width:540px;text-align:center;padding:32px;background:var(--bg-surface-elevated, var(--white));border:1px solid var(--border-subtle, var(--line));border-radius:20px">
            <h3 style="margin-bottom:10px;color:var(--text-primary, var(--ink))">\${txt('تعذر تحميل الامتحان التجريبي','Fehler beim Laden der Simulation')}</h3>
            <p class="muted" style="margin-bottom:20px;color:var(--text-secondary, var(--muted))">\${txt('حدث خطأ أثناء الاتصال بالخادم. يرجى إعادة المحاولة.','Verbindungsfehler. Bitte erneut versuchen.')}</p>
            <button class="btn self-test-btn" type="button" style="min-width:180px;min-height:44px" onclick="location.reload()">\${txt('إعادة المحاولة','Erneut versuchen')}</button>
          </div>\`;
      }
    }
  }
})();
logoutLink.onclick=async e=>{e.preventDefault();await api('auth-logout',{method:'POST'});location.href='/';};
</script>
</body>
</html>
`;

/* --------------------------------------------------------------------------
   2. Modernized public/self-test-result.html
   -------------------------------------------------------------------------- */
const modernizedSelfTestResultHtml = `<!doctype html>
<html lang="ar" dir="ltr">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width,initial-scale=1,viewport-fit=cover">
<meta name="theme-color" content="#080808">
<title>نتيجة الامتحان التجريبي — TELC Voll</title>
<link rel="stylesheet" href="/assets/app.css?v=20261002-mock-v7d">
<link rel="icon" href="/assets/favicon-light.svg" type="image/svg+xml" media="(prefers-color-scheme: light)">
<link rel="icon" href="/assets/favicon-dark.svg" type="image/svg+xml" media="(prefers-color-scheme: dark)">
<link rel="alternate icon" href="/assets/favicon-light.png" type="image/png" media="(prefers-color-scheme: light)">
<link rel="alternate icon" href="/assets/favicon-dark.png" type="image/png" media="(prefers-color-scheme: dark)">
<link rel="manifest" href="/manifest.webmanifest">
<style>
/* TELC Voll: unified typography */
html,html body,html body *{font-family:"Cairo","Segoe UI",Arial,sans-serif !important;}
html body h1,html body h2,html body h3,html body h4,html body h5,html body h6,html body button,html body input,html body textarea,html body select,html body label,html body a{font-family:"Cairo","Segoe UI",Arial,sans-serif !important;}
</style>
<style id="self-test-result-modern-styles">
/* TELC Voll — Phase 7D Mock Exam Result Modernization (Quiet Luxury + Soft Glass) */
.result-page {
  direction: ltr !important;
  max-width: 1100px;
  margin: 0 auto;
  padding: 32px 20px 80px;
  box-sizing: border-box;
}

/* Master Hero Card (Light & Dark Mode tokenized, no hardcoded white) */
.result-hero {
  border-radius: 28px !important;
  padding: clamp(32px, 5vw, 48px) clamp(20px, 4vw, 36px) !important;
  background: var(--bg-surface-elevated, var(--white)) !important;
  border: 1.5px solid var(--border-subtle, var(--line)) !important;
  box-shadow: var(--shadow-card, 0 10px 36px rgba(0,0,0,0.06)) !important;
  text-align: center;
  position: relative;
  overflow: hidden;
  box-sizing: border-box;
  transition: all 0.25s ease;
}

/* Semantic Status Gradient Overlays */
.result-hero.pass {
  background: linear-gradient(180deg, var(--state-success-subtle, rgba(16, 185, 129, 0.10)) 0%, var(--bg-surface-elevated, var(--white)) 100%) !important;
  border-color: var(--state-success-border, rgba(16, 185, 129, 0.3)) !important;
}

.result-hero.encourage {
  background: linear-gradient(180deg, var(--state-danger-subtle, rgba(239, 68, 68, 0.08)) 0%, var(--bg-surface-elevated, var(--white)) 100%) !important;
  border-color: var(--state-danger-border, rgba(239, 68, 68, 0.25)) !important;
}

/* Circular Status Icon Glow */
.result-icon-glow {
  width: 78px;
  height: 78px;
  border-radius: 50%;
  display: grid;
  place-items: center;
  margin: 0 auto 16px;
  font-size: 38px;
  transition: transform 0.3s cubic-bezier(0.16, 1, 0.3, 1);
}

.result-hero.pass .result-icon-glow {
  background: var(--state-success-subtle, rgba(16, 185, 129, 0.12));
  color: var(--state-success, #10B981);
  border: 2px solid var(--state-success-border, rgba(16, 185, 129, 0.35));
  box-shadow: 0 4px 20px rgba(16, 185, 129, 0.18);
}

.result-hero.encourage .result-icon-glow {
  background: var(--state-danger-subtle, rgba(239, 68, 68, 0.12));
  color: var(--state-danger, #EF4444);
  border: 2px solid var(--state-danger-border, rgba(239, 68, 68, 0.3));
  box-shadow: 0 4px 20px rgba(239, 68, 68, 0.18);
}

/* Exam Meta Tag */
.result-hero .tag {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  background: var(--brand-subtle, rgba(255, 122, 47, 0.08));
  color: var(--brand-primary, #FF7A2F);
  border: 1px solid var(--brand-border, rgba(255, 122, 47, 0.28));
  padding: 5px 16px;
  border-radius: 999px;
  font-size: 13px;
  font-weight: 850;
  letter-spacing: 0.02em;
}

/* Status Heading */
.result-status {
  font-size: clamp(24px, 4vw, 38px) !important;
  font-weight: 950 !important;
  letter-spacing: -0.025em;
  margin: 14px 0 12px !important;
  line-height: 1.3 !important;
}

.result-hero.pass .result-status {
  color: var(--state-success, #10B981) !important;
}

.result-hero.encourage .result-status {
  color: var(--state-danger, #EF4444) !important;
}

/* Subtitle Context */
.result-sub {
  color: var(--text-secondary, var(--ink)) !important;
  font-size: 15.5px !important;
  line-height: 1.75 !important;
  max-width: 800px !important;
  margin: 0 auto 24px !important;
  font-weight: 600 !important;
}

/* Metric Badges Row */
.result-badges-row {
  display: flex !important;
  justify-content: center !important;
  gap: 14px !important;
  flex-wrap: wrap !important;
  margin-top: 16px !important;
}

.result-badge-item {
  background: var(--bg-surface, var(--bg)) !important;
  border: 1px solid var(--border-subtle, var(--line)) !important;
  border-radius: 16px !important;
  padding: 12px 22px !important;
  min-width: 140px !important;
  box-shadow: var(--shadow-subtle, 0 1px 3px rgba(0,0,0,0.05)) !important;
  box-sizing: border-box;
}

.result-badge-item small {
  display: block;
  color: var(--text-muted, var(--muted)) !important;
  font-size: 12px !important;
  font-weight: 800 !important;
  letter-spacing: 0.02em;
}

.result-badge-item strong {
  display: block;
  font-size: 19px !important;
  font-weight: 950 !important;
  color: var(--text-primary, var(--ink)) !important;
  margin-top: 3px;
  font-variant-numeric: tabular-nums;
}

/* Official TELC Certificate Score Card */
.telc-cert-card {
  background: var(--bg-surface-elevated, var(--white)) !important;
  border: 1.5px solid var(--border-subtle, var(--line)) !important;
  border-radius: 24px !important;
  padding: clamp(24px, 4vw, 36px) !important;
  margin: 28px 0 !important;
  box-shadow: var(--shadow-card, 0 8px 30px rgba(0,0,0,0.05)) !important;
  position: relative;
  box-sizing: border-box;
}

.telc-cert-head {
  display: flex !important;
  justify-content: space-between !important;
  align-items: center !important;
  border-bottom: 2px solid var(--border-subtle, var(--line)) !important;
  padding-bottom: 16px !important;
  margin-bottom: 22px !important;
  flex-wrap: wrap !important;
  gap: 12px !important;
}

.telc-cert-title {
  font-size: 19.5px !important;
  font-weight: 950 !important;
  color: var(--text-primary, var(--ink)) !important;
  display: flex !important;
  align-items: center !important;
  gap: 10px !important;
}

.telc-cert-pill {
  background: var(--brand-subtle, rgba(255, 122, 47, 0.08)) !important;
  color: var(--brand-primary, #FF7A2F) !important;
  border: 1px solid var(--brand-border, rgba(255, 122, 47, 0.28)) !important;
  padding: 4px 14px !important;
  border-radius: 999px !important;
  font-size: 12.5px !important;
  font-weight: 850 !important;
}

.telc-cert-table {
  display: flex !important;
  flex-direction: column !important;
  gap: 12px !important;
  max-width: 760px !important;
  margin: 0 auto !important;
}

.telc-cert-row {
  display: flex !important;
  align-items: baseline !important;
  justify-content: space-between !important;
  padding: 10px 0 !important;
  font-size: 17.5px !important;
  font-weight: 850 !important;
  color: var(--text-primary, var(--ink)) !important;
  border-bottom: 1px dashed var(--border-subtle, var(--line)) !important;
}

.telc-cert-row.total-row {
  font-size: 20px !important;
  font-weight: 1000 !important;
  border-bottom: 2px solid var(--border-strong, var(--line)) !important;
  padding-bottom: 14px !important;
  margin-bottom: 4px !important;
}

.telc-cert-row.sub-row {
  font-size: 16px !important;
  font-weight: 800 !important;
  padding-inline-start: 12px !important;
}

.telc-cert-score-wrap {
  display: inline-flex !important;
  align-items: baseline !important;
  gap: 8px !important;
  font-variant-numeric: tabular-nums !important;
  font-weight: 900 !important;
  direction: ltr !important;
}

.telc-cert-score-val {
  display: inline-block !important;
  min-width: 68px !important;
  text-align: end !important;
  padding-bottom: 2px !important;
  border-bottom: 1.5px solid var(--border-strong, var(--ink)) !important;
  font-size: 19px !important;
  font-weight: 1000 !important;
  color: var(--text-primary, var(--ink)) !important;
}

.telc-cert-row.total-row .telc-cert-score-val {
  font-size: 23px !important;
  border-bottom-width: 2.5px !important;
  border-bottom-color: var(--brand-primary, #FF7A2F) !important;
  color: var(--brand-primary, #FF7A2F) !important;
}

.telc-cert-max {
  color: var(--text-muted, var(--muted)) !important;
  font-size: 15px !important;
  font-weight: 800 !important;
}

/* Section Breakdown Cards */
.result-grid {
  display: grid !important;
  grid-template-columns: repeat(2, 1fr) !important;
  gap: 18px !important;
  margin-top: 24px !important;
}

.result-section {
  background: var(--bg-surface-elevated, var(--white)) !important;
  border: 1.5px solid var(--border-subtle, var(--line)) !important;
  border-radius: 20px !important;
  padding: 22px !important;
  box-shadow: var(--shadow-card, 0 4px 18px rgba(0,0,0,0.04)) !important;
  transition: all 0.2s ease !important;
  box-sizing: border-box;
}

.result-section.pass {
  border-color: var(--state-success-border, rgba(16, 185, 129, 0.35)) !important;
}

.result-section.fail {
  border-color: var(--state-danger-border, rgba(239, 68, 68, 0.3)) !important;
}

.result-section-head {
  display: flex !important;
  justify-content: space-between !important;
  gap: 12px !important;
  align-items: center !important;
}

.result-section-head h3 {
  margin: 0 !important;
  font-size: 18.5px !important;
  font-weight: 950 !important;
  color: var(--text-primary, var(--ink)) !important;
}

.result-section-score {
  font-size: 20px !important;
  font-weight: 1000 !important;
  font-variant-numeric: tabular-nums !important;
  color: var(--text-primary, var(--ink)) !important;
  direction: ltr !important;
}

.result-bar {
  height: 8px !important;
  background: var(--border-subtle, var(--line)) !important;
  border-radius: 999px !important;
  overflow: hidden !important;
  margin: 16px 0 10px !important;
}

.result-bar i {
  display: block !important;
  height: 100% !important;
  border-radius: inherit !important;
  background: var(--state-success, #10B981) !important;
  transition: width 0.4s ease !important;
}

.result-section.fail .result-bar i {
  background: var(--state-danger, #EF4444) !important;
}

.result-meta {
  display: flex !important;
  justify-content: space-between !important;
  color: var(--text-secondary, var(--muted)) !important;
  font-size: 13.5px !important;
  font-weight: 850 !important;
  align-items: center;
}

.result-meta span {
  font-variant-numeric: tabular-nums;
}

.result-section.pass .result-meta b {
  color: var(--state-success, #10B981);
}

.result-section.fail .result-meta b {
  color: var(--state-danger, #EF4444);
}

/* Subscores for Writing AI criteria */
.subscores {
  display: grid !important;
  gap: 8px !important;
  margin-top: 14px !important;
  padding-top: 12px !important;
  border-top: 1px dashed var(--border-subtle, var(--line)) !important;
}

.subscore {
  display: flex !important;
  justify-content: space-between !important;
  padding: 8px 12px !important;
  background: var(--bg-surface, var(--bg)) !important;
  border: 1px solid var(--border-subtle, var(--line)) !important;
  border-radius: 10px !important;
  font-size: 13.5px !important;
  font-weight: 800 !important;
  color: var(--text-primary, var(--ink)) !important;
}

.subscore b {
  font-variant-numeric: tabular-nums;
  color: var(--text-primary, var(--ink));
}

/* Action Toolbar */
.result-actions {
  display: flex !important;
  justify-content: center !important;
  gap: 14px !important;
  margin-top: 36px !important;
  flex-wrap: wrap !important;
}

.result-actions .result-btn {
  font-size: 15px !important;
  padding: 12px 24px !important;
  border-radius: 14px !important;
  font-weight: 900 !important;
  min-height: 48px !important;
  cursor: pointer !important;
  transition: all 0.2s cubic-bezier(0.16, 1, 0.3, 1) !important;
  display: inline-flex !important;
  align-items: center !important;
  justify-content: center !important;
  gap: 8px !important;
  text-decoration: none !important;
  box-sizing: border-box;
}

.result-actions .btn-primary {
  background: var(--brand-primary, #FF7A2F) !important;
  color: #ffffff !important;
  border: none !important;
  box-shadow: 0 4px 18px var(--brand-glow, rgba(255, 122, 47, 0.35)) !important;
}

.result-actions .btn-primary:hover {
  background: var(--brand-hover, #FF8D47) !important;
  box-shadow: 0 6px 24px var(--brand-glow, rgba(255, 122, 47, 0.45)) !important;
  transform: translateY(-2px);
}

.result-actions .btn-secondary {
  background: var(--bg-surface-elevated, var(--white)) !important;
  color: var(--text-primary, var(--ink)) !important;
  border: 1.5px solid var(--border-strong, var(--line)) !important;
  box-shadow: var(--shadow-subtle, 0 1px 3px rgba(0,0,0,0.04)) !important;
}

.result-actions .btn-secondary:hover {
  background: var(--bg-surface-hover, var(--bg)) !important;
  border-color: var(--text-muted, var(--muted)) !important;
  transform: translateY(-1px);
}

.result-actions .btn-neutral {
  background: var(--bg-surface, var(--bg)) !important;
  color: var(--text-secondary, var(--muted)) !important;
  border: 1px solid var(--border-subtle, var(--line)) !important;
}

.result-actions .btn-neutral:hover {
  color: var(--text-primary, var(--ink)) !important;
  background: var(--bg-surface-elevated, var(--white)) !important;
  border-color: var(--border-strong, var(--line)) !important;
  transform: translateY(-1px);
}

/* Responsive Reflow */
@media (max-width: 768px) {
  .result-page {
    padding: 16px 12px 60px !important;
  }
  .result-hero {
    padding: 24px 16px !important;
    border-radius: 20px !important;
  }
  .result-grid {
    grid-template-columns: 1fr !important;
    gap: 14px !important;
  }
  .telc-cert-card {
    padding: 22px 16px !important;
    border-radius: 20px !important;
  }
  .telc-cert-row {
    font-size: 15.5px !important;
  }
  .telc-cert-row.total-row {
    font-size: 17.5px !important;
  }
  .telc-cert-score-val {
    font-size: 17px !important;
    min-width: 56px !important;
  }
  .result-badges-row {
    gap: 10px !important;
  }
  .result-badge-item {
    flex: 1 1 calc(50% - 10px);
    min-width: 0 !important;
    padding: 10px 14px !important;
  }
  .result-actions {
    flex-direction: column !important;
    gap: 10px !important;
  }
  .result-actions .result-btn {
    width: 100% !important;
  }
}

/* High-Precision Clean Print Stylesheet */
@media print {
  @page {
    margin: 12mm;
    size: auto;
  }
  body {
    background: #ffffff !important;
    color: #000000 !important;
  }
  header.top,
  .result-actions,
  .nav-logout-btn,
  #logoutLink,
  .brand {
    display: none !important;
  }
  .result-page {
    max-width: 100% !important;
    padding: 0 !important;
    margin: 0 !important;
  }
  .result-hero {
    background: #fbfbfb !important;
    border: 1px solid #d0d0d0 !important;
    box-shadow: none !important;
    color: #000000 !important;
    break-inside: avoid;
    page-break-inside: avoid;
    padding: 20px !important;
    margin-bottom: 20px !important;
  }
  .result-hero.pass .result-status {
    color: #0a7a40 !important;
  }
  .result-hero.encourage .result-status {
    color: #c94a43 !important;
  }
  .result-sub {
    color: #333333 !important;
  }
  .result-badge-item {
    background: #ffffff !important;
    border: 1px solid #cccccc !important;
    color: #000000 !important;
  }
  .result-badge-item small {
    color: #666666 !important;
  }
  .result-badge-item strong {
    color: #000000 !important;
  }
  .telc-cert-card {
    background: #ffffff !important;
    border: 1.5px solid #000000 !important;
    box-shadow: none !important;
    color: #000000 !important;
    break-inside: avoid;
    page-break-inside: avoid;
    margin: 20px 0 !important;
    padding: 18px !important;
  }
  .telc-cert-title {
    color: #000000 !important;
  }
  .telc-cert-pill {
    background: #f0f0f0 !important;
    color: #000000 !important;
    border-color: #999999 !important;
  }
  .telc-cert-row {
    color: #000000 !important;
    border-bottom-color: #cccccc !important;
  }
  .telc-cert-score-val {
    color: #000000 !important;
    border-bottom-color: #000000 !important;
  }
  .result-grid {
    grid-template-columns: repeat(2, 1fr) !important;
    gap: 12px !important;
  }
  .result-section {
    background: #ffffff !important;
    border: 1px solid #cccccc !important;
    box-shadow: none !important;
    break-inside: avoid;
    page-break-inside: avoid;
    color: #000000 !important;
    padding: 14px !important;
  }
  .result-section-head h3,
  .result-section-score {
    color: #000000 !important;
  }
  .result-bar {
    background: #e0e0e0 !important;
  }
  .result-bar i {
    background: #333333 !important;
  }
  .subscore {
    background: #f9f9f9 !important;
    border: 1px solid #eeeeee !important;
    color: #000000 !important;
  }
}
</style>
</head>
<body>
<header class="top">
  <a class="brand" href="/dashboard.html"><span class="brand-mark"><span class="brand-dot"></span>TELC Voll</span></a>
  <nav class="student-nav-links">
    <a href="/dashboard.html" data-i18n="nav_home_student">منصة الطالب</a>
    <a href="/self-test.html" data-i18n="nav_mock">امتحان تجريبي</a>
    <a href="/telc-chat.html" data-i18n="nav_speaking">مساعد TELC</a>
    <a href="/profile.html" data-i18n="profile_link">ملفي</a>
    <a href="#" id="logoutLink" data-i18n="nav_logout" class="nav-logout-btn">خروج</a>
  </nav>
  <span class="header-actions"></span>
</header>

<main id="content" class="result-page"></main>

<script src="/assets/i18n.js?v=20260927-subscription-activation-mail-v10"></script>
<script src="/assets/app.js"></script>
<script>
const r = JSON.parse(localStorage.getItem('telc_mock_result') || 'null');
if (!r) { location.href = '/dashboard.html'; }

const sectionNames = ['Lesen', 'Sprachbausteine', 'Hören', 'Schreiben'];
const SECTION_DE_NAMES = {
  Lesen: 'Leseverstehen',
  Sprachbausteine: 'Sprachbausteine',
  Hören: 'Hörverstehen',
  Schreiben: 'Schriftlicher Ausdruck'
};

var text = window.text || ((ar, de) => getLang() === 'ar' ? ar : de);

function formatGermanScore(num) {
  const n = Number(num || 0);
  return n.toFixed(1).replace('.', ',');
}

function pct(s) {
  return s && s.max ? Math.round((Number(s.score) / Number(s.max)) * 10000) / 100 : 0;
}

function render() {
  const sections = {...(r?.sections || {})};
  const schrift = sectionNames.reduce((sum, name) => sum + Number(sections[name]?.score || 0), 0);
  const schriftMax = 225;
  const writtenPass = schrift >= 135;
  const passed = writtenPass;
  const grade = writtenPass ? (schrift >= 210 ? 'Sehr gut' : schrift >= 180 ? 'Gut' : schrift >= 157.5 ? 'Befriedigend' : 'Ausreichend') : 'Nicht bestanden';

  const cards = sectionNames.map(name => {
    const fallback = name === 'Lesen' ? 75 : name === 'Sprachbausteine' ? 30 : name === 'Hören' ? 75 : 45;
    const s = sections[name] || { score: 0, max: fallback };
    const p = pct(s);
    const ok = p >= 60;
    const deTitle = SECTION_DE_NAMES[name] || name;

    let sub = '';
    if (name === 'Schreiben' && r.writing?.criteria && r.writing.criteria.length) {
      sub = r.writing.criteria.map(x => \`
        <div class="subscore">
          <span>\${esc(x.label || x.name)}</span>
          <b>\${formatGermanScore(x.score)} / \${x.max}</b>
        </div>\`).join('');
    }

    return \`
      <article class="result-section \${ok ? 'pass' : 'fail'}">
        <div class="result-section-head">
          <div>
            <h3>\${esc(deTitle)}</h3>
            <small class="muted">\${esc(name)}</small>
          </div>
          <span class="result-section-score">\${formatGermanScore(s.score)} / \${s.max}</span>
        </div>
        <div class="result-bar"><i style="width:\${Math.min(100, p)}%"></i></div>
        <div class="result-meta">
          <span>\${p.toFixed(1)}%</span>
          <b>\${ok ? text('ناجح ✓', 'Bestanden ✓') : text('غير مجتاز', 'Nicht bestanden')}</b>
        </div>
        \${sub ? \`<div class="subscores">\${sub}</div>\` : ''}
      </article>\`;
  }).join('');

  document.getElementById('content').innerHTML = \`
    <!-- Hero Status & Encouragement -->
    <section class="result-hero \${passed ? 'pass' : 'encourage'}">
      <div class="result-icon-glow">
        <span class="result-icon">\${passed ? '🏆' : '💪'}</span>
      </div>
      <div class="tag">TELC Voll · Prüfungssimulation · \${esc(r.level || 'B2')}</div>
      <h1 class="result-status">
        \${passed 
          ? text('أحسنت. اجتزت معيار الجزء الكتابي في هذه المحاكاة.', 'Gut gemacht. Du hast die Bestehensgrenze der schriftlichen Prüfungssimulation erreicht.')
          : text('هذه محاولة قيّمة وممتازة للتدريب. الجزء الكتابي لم يصل بعد إلى حد النجاح، ويمكنك تحديد نقاط الضعف من التفصيل أدناه.', 'Ein aussagekräftiges Trainingsergebnis. Die schriftliche Bestehensgrenze wurde noch nicht erreicht. Die Auswertung zeigt dir die Bereiche mit Verbesserungsbedarf.')}
      </h1>
      <p class="result-sub">
        \${passed 
          ? text('حققت ' + formatGermanScore(schrift) + ' من 225 نقطة. في امتحان TELC ' + esc(r.level || 'B2') + ' الرسمي، يحتاج الجزء الكتابي إلى 135 نقطة على الأقل، كما يتطلب النجاح في الامتحان الكامل اجتياز الجزء الشفهي أيضًا.', 'Du hast ' + formatGermanScore(schrift) + ' von 225 Punkten erreicht. Im offiziellen telc ' + esc(r.level || 'B2') + ' sind mindestens 135 Punkte im schriftlichen Teil erforderlich; für die gesamte Prüfung muss zusätzlich der mündliche Teil bestanden werden.')
          : text('حققت ' + formatGermanScore(schrift) + ' من 225 نقطة. حد الجزء الكتابي هو 135 نقطة. استخدم تفاصيل الأقسام لمعرفة أين تحتاج إلى مزيد من التدريب، ثم أعد المحاكاة.', 'Du hast ' + formatGermanScore(schrift) + ' von 225 Punkten erreicht. Die Bestehensgrenze des schriftlichen Teils liegt bei 135 Punkten. Nutze die Bereichsauswertung, um gezielt weiterzuüben und die Simulation erneut zu absolvieren.')}
      </p>
      <div class="result-badges-row">
        <div class="result-badge-item">
          <small>\${text('التقدير التقريبي', 'Prädikat')}</small>
          <strong>\${grade}</strong>
        </div>
        <div class="result-badge-item">
          <small>\${text('حد الجزء الكتابي', 'Bestehensgrenze schriftlich')}</small>
          <strong>135 / 225 (60%)</strong>
        </div>
        <div class="result-badge-item">
          <small>\${text('النسبة المحققة', 'Erreichte Quote')}</small>
          <strong style="color:\${passed ? 'var(--state-success, #10B981)' : 'var(--state-danger, #EF4444)'}">\${((schrift/225)*100).toFixed(1)}%</strong>
        </div>
      </div>
    </section>

    <!-- Official TELC Certificate Score Card -->
    <div class="telc-cert-card">
      <div class="telc-cert-head">
        <div class="telc-cert-title">
          <span>📜</span>
          <span>\${text('كشف درجات الامتحان الكتابي (TELC ' + esc(r.level || 'B2') + ')', 'Ergebnis der schriftlichen Prüfung (TELC ' + esc(r.level || 'B2') + ')') }</span>
        </div>
        <span class="telc-cert-pill">\${text('تنسيق قريب من كشف الدرجات', 'Ergebnisübersicht im Prüfungsformat')}</span>
      </div>

      <div class="telc-cert-table">
        <div class="telc-cert-row total-row">
          <span>Schriftliche Prüfung</span>
          <span class="telc-cert-score-wrap">
            <span class="telc-cert-score-val">\${formatGermanScore(schrift)}</span>
            <span class="telc-cert-max">/ 225 Punkte</span>
          </span>
        </div>

        <div class="telc-cert-row sub-row">
          <span>• Leseverstehen</span>
          <span class="telc-cert-score-wrap">
            <span class="telc-cert-score-val">\${formatGermanScore(sections.Lesen?.score || 0)}</span>
            <span class="telc-cert-max">/ 75 Punkte</span>
          </span>
        </div>

        <div class="telc-cert-row sub-row">
          <span>• Sprachbausteine</span>
          <span class="telc-cert-score-wrap">
            <span class="telc-cert-score-val">\${formatGermanScore(sections.Sprachbausteine?.score || 0)}</span>
            <span class="telc-cert-max">/ 30 Punkte</span>
          </span>
        </div>

        <div class="telc-cert-row sub-row">
          <span>• Hörverstehen</span>
          <span class="telc-cert-score-wrap">
            <span class="telc-cert-score-val">\${formatGermanScore(sections.Hören?.score || 0)}</span>
            <span class="telc-cert-max">/ 75 Punkte</span>
          </span>
        </div>

        <div class="telc-cert-row sub-row">
          <span>• Schriftlicher Ausdruck</span>
          <span class="telc-cert-score-wrap">
            <span class="telc-cert-score-val">\${formatGermanScore(sections.Schreiben?.score || 0)}</span>
            <span class="telc-cert-max">/ 45 Punkte</span>
          </span>
        </div>
      </div>
    </div>

    <!-- Breakdown Grid -->
    <div class="result-grid">
      \${cards}
    </div>

    <!-- Actions Toolbar -->
    <div class="result-actions">
      <button type="button" class="btn result-btn btn-secondary" onclick="window.print()">🖨️ \${text('طباعة النتيجة', 'Ergebnis drucken')}</button>
      <a class="btn result-btn btn-primary" href="/self-test.html?level=\${encodeURIComponent(r.level || 'B2')}">🔄 \${text('إعادة الامتحان التجريبي', 'Prüfung wiederholen')}</a>
      <a class="btn result-btn btn-neutral" href="/dashboard.html">🏠 \${text('العودة إلى المنصة', 'Zurück zur Plattform')}</a>
    </div>
  \`;
}

function enforceResultLTR(){
  document.documentElement.setAttribute('dir','ltr');
  document.body.setAttribute('dir','ltr');
  document.documentElement.classList.add('mock-result-ltr');
}

enforceResultLTR();
window.addEventListener('langchange', () => {
  enforceResultLTR();
  render();
});

render();
if (document.getElementById('logoutLink')) {
  document.getElementById('logoutLink').onclick = async e => {
    e.preventDefault();
    if (typeof api === 'function') {
      try { await api('auth-logout', { method: 'POST' }); } catch(err) {}
    }
    location.href = '/';
  };
}
</script>
</body>
</html>
`;

fs.writeFileSync(selfTestPath, modernizedSelfTestHtml, 'utf8');
console.log('✓ Modernized public/self-test.html successfully!');

fs.writeFileSync(selfTestResultPath, modernizedSelfTestResultHtml, 'utf8');
console.log('✓ Modernized public/self-test-result.html successfully!');

console.log('\n========================================================================');
console.log('  PHASE 7D MODERNIZATION APPLIED CLEANLY!                               ');
console.log('========================================================================\n');
