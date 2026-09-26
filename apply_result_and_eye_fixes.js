const fs = require('fs');
const path = require('path');

console.log('--- Applying Result Score, Model Solution Guard & Eye Button Fixes ---');

// 1. Update public/exercise.html
let ex = fs.readFileSync('public/exercise.html', 'utf8');

// A. Add userCheckedAnswers to state variables
if (!ex.includes('let userCheckedAnswers=')) {
  ex = ex.replace('let submitInFlight=false;', 'let submitInFlight=false; let userCheckedAnswers=false;');
  console.log('✓ Added userCheckedAnswers state variable');
}

// B. Update renderExerciseHeaderCard
// Find from `const resultPanel = resultData ? ` up to `return \`\r?\n    <div class="exercise-header-card`
const resPanelStart = ex.indexOf('const resultPanel = resultData ?');
const returnHeaderCard = ex.indexOf('return `\n    <div class="exercise-header-card') !== -1
  ? ex.indexOf('return `\n    <div class="exercise-header-card')
  : ex.indexOf('return `\r\n    <div class="exercise-header-card');

if (resPanelStart !== -1 && returnHeaderCard !== -1) {
  const targetHeaderCardChunk = ex.slice(resPanelStart, returnHeaderCard);
  const isCRLF = targetHeaderCardChunk.includes('\r\n');
  const eol = isCRLF ? '\r\n' : '\n';

  const newHeaderCardChunk = `const showResultScore = userCheckedAnswers && resultData;
  const isPass = (resultData?.percent || 0) >= 60;
  const resultPanel = showResultScore ? \`
    <div class="inline-result-panel \${isPass ? 'pass' : 'fail'}">
      <span class="result-panel-icon" aria-hidden="true">\${isPass ? '✓' : '✕'}</span>
      <span class="result-panel-label">\${text('النتيجة:','Ergebnis:')}</span>
      <strong class="result-panel-score">\${resultData.score} / \${resultData.max}</strong>
      <span class="result-panel-percent">(\${resultData.percent}%)</span>
    </div>\` : '';

  let titleMarkup = '';
  if (!mockMode && title) {
    if (titleRevealed) {
      titleMarkup = \`
        <div class="thema-title-row is-revealed-title">
          <div class="thema-title-content">
            <h1 id="thema-title" data-content-id="thema-title" data-source="\${esc(title)}">\${esc(title)}</h1>
          </div>
          <div class="thema-tools">
            \${textTools(title, 'thema-title')}
            <button type="button" class="title-reveal-btn title-eye-btn is-revealed" id="titleRevealBtn" title="\${text('إخفاء العنوان','Thema verbergen')}" aria-label="\${text('إخفاء العنوان','Thema verbergen')}">
              <svg class="eye-svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#f47b20" stroke-width="2.3" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"></path><line x1="1" y1="1" x2="23" y2="23"></line></svg>
            </button>
            <div class="inline-translation" id="thema-title-translation"></div>
          </div>
        </div>\`;
    } else {
      titleMarkup = \`
        <div class="thema-title-row is-hidden-title">
          <div class="thema-masked-wrapper thema-blurred-card" id="titleMaskedBox" role="button" tabindex="0" title="\${text('انقر لإظهار العنوان','Klicken zum Einblenden')}" aria-label="\${text('انقر لإظهار العنوان','Klicken zum Einblenden')}">
            <span class="thema-blurred-text frosted-ghost-bars" aria-hidden="true">
              <span class="ghost-bar ghost-bar-long"></span>
              <span class="ghost-bar ghost-bar-short"></span>
            </span>
            <div class="thema-blurred-badge">
              <span class="masked-lock-badge" aria-hidden="true">🔒</span>
              <span class="masked-hint">\${text('العنوان مخفي أثناء التدريب (انقر للإظهار)','Thema ausgeblendet (Klicken zum Anzeigen)')}</span>
            </div>
          </div>
          <div class="thema-tools">
            <button type="button" class="title-reveal-btn title-eye-btn" id="titleRevealBtn" title="\${text('إظهار العنوان','Thema anzeigen')}" aria-label="\${text('إظهار العنوان','Thema anzeigen')}">
              <svg class="eye-svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#f47b20" stroke-width="2.3" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path><circle cx="12" cy="12" r="3"></circle></svg>
            </button>
          </div>
        </div>\`;
    }
  }

  const hasBottomBar = Boolean(headingShuffle || resultPanel);
  const bottomBar = hasBottomBar ? \`
    <div class="exercise-sub-bar exercise-card-bottom-bar" id="exerciseSubBar">
      <div class="exercise-sub-items">
        \${resultPanel}
        \${headingShuffle}
      </div>
    </div>\` : '';

  `;

  ex = ex.replace(targetHeaderCardChunk, newHeaderCardChunk.replace(/\n/g, eol));
  console.log('✓ Updated renderExerciseHeaderCard (result score pill & eye button positioning)');
} else {
  console.error('✗ Failed to find targetHeaderCardChunk');
}

// C. Update submit and modelBtn in bindActions
// Update submit function definition to accept isExplicitCheck
const submitDefOld = 'async function submit(){';
const submitDefNew = 'async function submit(isExplicitCheck = true){';
if (ex.includes(submitDefOld)) {
  ex = ex.replace(submitDefOld, submitDefNew);
  console.log('✓ Updated submit signature to accept isExplicitCheck');
}

// In submit(): set userCheckedAnswers = true only when isExplicitCheck is true
const submitBodyOld = `  if(!model.items.length){if(mockMode){goNextMock();}return;}
  if(submitInFlight || submitted) return;
  submitInFlight=true;
  const btn=document.getElementById('checkBtn');
  if(btn){btn.disabled=true;btn.dataset.oldText=btn.textContent;btn.textContent=text('جارٍ التحقق…','Wird geprüft…');}
  showModelAnswers=false;`;

const submitBodyNew = `  if(isExplicitCheck) userCheckedAnswers = true;
  if(!model.items.length){if(mockMode){goNextMock();}return;}
  if(submitInFlight || (submitted && isExplicitCheck)) return;
  submitInFlight=true;
  const btn=document.getElementById('checkBtn');
  if(isExplicitCheck && btn){btn.disabled=true;btn.dataset.oldText=btn.textContent;btn.textContent=text('جارٍ التحقق…','Wird geprüft…');}
  if(isExplicitCheck) showModelAnswers=false;`;

const isExCRLF = ex.includes('\r\n');
const normBodyOld = submitBodyOld.replace(/\r?\n/g, isExCRLF ? '\r\n' : '\n');
const normBodyNew = submitBodyNew.replace(/\r?\n/g, isExCRLF ? '\r\n' : '\n');

if (ex.includes(normBodyOld)) {
  ex = ex.replace(normBodyOld, normBodyNew);
  console.log('✓ Updated submit() body to respect isExplicitCheck');
} else {
  console.error('✗ Failed to find submitBodyOld');
}

// In bindActions: checkBtn calls submit(true), and modelBtn calls submit(false)
const modelBtnOld = `     if(model?.exercise?.section==='Hören'){
       // Hören stores the correct answer on each exercise item, so it can be shown directly.
       showModelAnswers=!showModelAnswers;
     }else{
       if(!submitted && !resultData) await submit();
       showModelAnswers=!showModelAnswers;
     }`;

const modelBtnNew = `     if(model?.exercise?.section==='Hören'){
       showModelAnswers=!showModelAnswers;
     }else{
       if(!resultData) await submit(false);
       showModelAnswers=!showModelAnswers;
     }`;

const normModelOld = modelBtnOld.replace(/\r?\n/g, isExCRLF ? '\r\n' : '\n');
const normModelNew = modelBtnNew.replace(/\r?\n/g, isExCRLF ? '\r\n' : '\n');

if (ex.includes(normModelOld)) {
  ex = ex.replace(normModelOld, normModelNew);
  console.log('✓ Updated modelBtn to call submit(false) so score never appears upon model answer toggle');
} else {
  console.error('✗ Failed to find modelBtnOld');
}

// In bindActions: wire checkBtn to submit(true)
ex = ex.replace('if(b)b.onclick=submit;', 'if(b)b.onclick=()=>submit(true);');

// When shuffling: reset userCheckedAnswers
ex = ex.replace('submitted=false; resultData=null; showModelAnswers=false;', 'submitted=false; resultData=null; showModelAnswers=false; userCheckedAnswers=false;');

fs.writeFileSync('public/exercise.html', ex, 'utf8');
console.log('Saved public/exercise.html');

// 2. Update public/assets/app.css for modern styling of result pill, eye button, and sub-bar
let css = fs.readFileSync('public/assets/app.css', 'utf8');

const modernCss = `
/* Modern Result Score Pill (No Nicht bestanden, vibrant Green / Red) */
.inline-result-panel {
  display: inline-flex !important;
  align-items: center !important;
  gap: 9px !important;
  padding: 7px 18px !important;
  border-radius: 999px !important;
  font-size: 14.5px !important;
  font-weight: 850 !important;
  backdrop-filter: blur(14px) !important;
  -webkit-backdrop-filter: blur(14px) !important;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.05) !important;
  transition: all 0.25s ease !important;
}

.inline-result-panel.pass {
  background: rgba(45, 155, 104, 0.12) !important;
  border: 1.5px solid rgba(45, 155, 104, 0.45) !important;
  color: #2d9b68 !important;
}

html[data-theme="dark"] .inline-result-panel.pass {
  background: rgba(45, 155, 104, 0.2) !important;
  border-color: rgba(45, 155, 104, 0.6) !important;
  color: #34d399 !important;
}

.inline-result-panel.fail {
  background: rgba(239, 68, 68, 0.12) !important;
  border: 1.5px solid rgba(239, 68, 68, 0.45) !important;
  color: #ef4444 !important;
}

html[data-theme="dark"] .inline-result-panel.fail {
  background: rgba(239, 68, 68, 0.2) !important;
  border-color: rgba(239, 68, 68, 0.6) !important;
  color: #f87171 !important;
}

.inline-result-panel .result-panel-icon {
  display: inline-flex !important;
  align-items: center !important;
  justify-content: center !important;
  width: 22px !important;
  height: 22px !important;
  border-radius: 50% !important;
  font-size: 13px !important;
  font-weight: 900 !important;
  line-height: 1 !important;
}

.inline-result-panel.pass .result-panel-icon {
  background: #2d9b68 !important;
  color: #ffffff !important;
}

.inline-result-panel.fail .result-panel-icon {
  background: #ef4444 !important;
  color: #ffffff !important;
}

.inline-result-panel .result-panel-label {
  font-weight: 850 !important;
  color: inherit !important;
}

.inline-result-panel .result-panel-score {
  font-weight: 950 !important;
  font-size: 15.5px !important;
  color: inherit !important;
}

.inline-result-panel .result-panel-percent {
  font-size: 13px !important;
  font-weight: 800 !important;
  opacity: 0.9 !important;
  color: inherit !important;
}

/* Eye button: transparent glass, pure crisp orange SVG stroke */
.exercise-header-card .title-reveal-btn,
.exercise-header-card .title-eye-btn {
  display: inline-flex !important;
  align-items: center !important;
  justify-content: center !important;
  width: 38px !important;
  height: 38px !important;
  min-width: 38px !important;
  padding: 0 !important;
  border-radius: 11px !important;
  cursor: pointer !important;
  background: transparent !important;
  border: 1.5px solid rgba(244, 123, 32, 0.45) !important;
  color: #f47b20 !important;
  box-shadow: none !important;
  transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1) !important;
}

html[data-theme="dark"] .exercise-header-card .title-reveal-btn,
html[data-theme="dark"] .exercise-header-card .title-eye-btn {
  background: transparent !important;
  border-color: rgba(244, 123, 32, 0.5) !important;
  box-shadow: none !important;
}

.exercise-header-card .title-reveal-btn:hover,
.exercise-header-card .title-eye-btn:hover {
  border-color: #f47b20 !important;
  background: rgba(244, 123, 32, 0.12) !important;
  transform: scale(1.05) !important;
}

.exercise-header-card .title-eye-btn .eye-svg {
  display: block !important;
  stroke: #f47b20 !important;
  fill: none !important;
}

/* Proper positioning: eye button sits next to title/hidden badge */
.exercise-header-card .thema-title-row {
  display: flex !important;
  align-items: center !important;
  justify-content: flex-start !important;
  gap: 14px !important;
  width: 100% !important;
  flex-wrap: wrap !important;
}

.exercise-header-card .thema-tools {
  display: inline-flex !important;
  align-items: center !important;
  gap: 8px !important;
}

/* Sub-bar: aligned naturally with content, NOT stuck at far left */
.exercise-header-card .exercise-sub-bar {
  display: flex !important;
  align-items: center !important;
  justify-content: flex-start !important;
  gap: 14px !important;
  margin-top: 14px !important;
  width: 100% !important;
  flex-wrap: wrap !important;
}

.exercise-header-card .exercise-sub-items {
  display: flex !important;
  align-items: center !important;
  gap: 14px !important;
  flex-wrap: wrap !important;
}
`;

css += modernCss;
fs.writeFileSync('public/assets/app.css', css, 'utf8');
console.log('Saved public/assets/app.css with modern result pill and proper eye button positioning');

// 3. Sync to github_update directories
const targets = ['E:\\\\telcvoll\\\\github_update', 'E:\\\\github_update_telcvoll'];
const syncFiles = [
  'public/exercise.html',
  'public/assets/app.css'
];

for (const tgt of targets) {
  for (const f of syncFiles) {
    const src = path.join('E:\\\\telcvoll', f);
    const dst = path.join(tgt, f);
    fs.copyFileSync(src, dst);
  }
}
console.log('✓ Synced updated files to delivery directories');
