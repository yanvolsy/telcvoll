const fs = require('fs');

let html = fs.readFileSync('public/exercise.html', 'utf8');

// 1. Update Writing heading
const oldWriting = `  document.getElementById('content').innerHTML=\`<div class="writing-page-shell">
   <div class="exercise-heading writing-heading">
     <div class="exercise-heading-title">
       <span class="tag">Telc \${esc(model.exercise.level||'B2')} · Schreiben</span>
       <div class="thema-title-row">
         <h1 id="thema-title" data-content-id="thema-title" data-source="\${esc(model.exercise.title||'')}">\${esc(model.exercise.title)}</h1>
         <div class="thema-tools">
           \${textTools(model.exercise.title||'','thema-title')}
           <div class="inline-translation" id="thema-title-translation"></div>
         </div>
       </div>
       <small>\${esc(model.exercise.teil||'Teil 1')}</small>
     </div>
     <div class="progress-pill" id="timerEl">\${initialMin}:00</div>
   </div>`;

const newWriting = `  document.getElementById('content').innerHTML=\`<div class="writing-page-shell">
   <div class="exercise-heading writing-heading">
     <div class="exercise-heading-meta">
       <div class="exercise-heading-tags">
         <span class="tag tag-level-section">Telc \${esc(model.exercise.level||'B2')} · Schreiben</span>
         <span class="tag tag-teil">\${esc(model.exercise.teil||'Teil 1')}</span>
       </div>
       <div class="exercise-heading-timer">
         <div class="progress-pill" id="timerEl"><span class="timer-icon" aria-hidden="true">⏱️</span> <span class="timer-digits">\${initialMin}:00</span></div>
       </div>
     </div>
     <div class="exercise-heading-title">
       <div class="thema-title-row">
         <h1 id="thema-title" data-content-id="thema-title" data-source="\${esc(model.exercise.title||'')}">\${esc(model.exercise.title)}</h1>
         <div class="thema-tools">
           \${textTools(model.exercise.title||'','thema-title')}
           <div class="inline-translation" id="thema-title-translation"></div>
         </div>
       </div>
     </div>
   </div>`;

if (html.includes(oldWriting)) {
  html = html.replace(oldWriting, newWriting);
  console.log('Writing heading updated successfully!');
} else {
  console.log('Writing heading target not matched directly, trying regex...');
  const writingRegex = /document\.getElementById\('content'\)\.innerHTML=`<div class="writing-page-shell">[\s\S]*?<div class="progress-pill" id="timerEl">\${initialMin}:00<\/div>\s*<\/div>/;
  if (writingRegex.test(html)) {
    html = html.replace(writingRegex, newWriting);
    console.log('Writing heading updated via regex!');
  } else {
    console.warn('Writing heading could not be found!');
  }
}

// 2. Update Speaking headings
const oldSpeaking1 = `    <div class="exercise-heading speaking-heading">
      <div class="exercise-heading-title">
        <span class="tag">Telc \${esc(model.exercise.level||'B2')} · Sprechen</span>
        <div class="thema-title-row">
          <h1 id="thema-title" data-content-id="thema-title" data-source="\${esc(model.exercise.title||'')}" class="\${titleRevealed?'':'thema-title-hidden'}">\${esc(model.exercise.title)}</h1>
          <div class="thema-tools">
            \${textTools(model.exercise.title,'thema-title')}
            <div class="inline-translation" id="thema-title-translation"></div>
            <button type="button" class="mini-tool title-reveal" id="titleReveal" aria-label="\${text('إظهار العنوان','Titel anzeigen')}"><span class="eye-icon eye-off"></span></button>
          </div>
        </div>
        <small>\${esc(teil)}</small>
      </div>
    </div>`;

const newSpeaking1 = `    <div class="exercise-heading speaking-heading">
      <div class="exercise-heading-meta">
        <div class="exercise-heading-tags">
          <span class="tag tag-level-section">Telc \${esc(model.exercise.level||'B2')} · Sprechen</span>
          <span class="tag tag-teil">\${esc(teil)}</span>
        </div>
      </div>
      <div class="exercise-heading-title">
        <div class="thema-title-row">
          <h1 id="thema-title" data-content-id="thema-title" data-source="\${esc(model.exercise.title||'')}" class="\${titleRevealed?'':'thema-title-hidden'}">\${esc(model.exercise.title)}</h1>
          <div class="thema-tools">
            \${textTools(model.exercise.title,'thema-title')}
            <div class="inline-translation" id="thema-title-translation"></div>
            <button type="button" class="mini-tool title-reveal" id="titleReveal" aria-label="\${text('إظهار العنوان','Titel anzeigen')}"><span class="eye-icon eye-off"></span></button>
          </div>
        </div>
      </div>
    </div>`;

const oldSpeaking2 = `  <div class="exercise-heading speaking-heading">
    <div class="exercise-heading-title">
      <span class="tag">Telc \${esc(model.exercise.level||'B2')} · Sprechen</span>
      <div class="thema-title-row">
        <h1 id="thema-title" data-content-id="thema-title" data-source="\${esc(model.exercise.title||'')}" class="\${titleRevealed?'':'thema-title-hidden'}">\${esc(model.exercise.title)}</h1>
        <div class="thema-tools">
          \${textTools(model.exercise.title,'thema-title')}
          <div class="inline-translation" id="thema-title-translation"></div>
          <button type="button" class="mini-tool title-reveal" id="titleReveal" aria-label="\${text('إظهار العنوان','Titel anzeigen')}"><span class="eye-icon eye-off"></span></button>
        </div>
      </div>
      <small>\${esc(teil)}</small>
    </div>
  </div>`;

const newSpeaking2 = `  <div class="exercise-heading speaking-heading">
    <div class="exercise-heading-meta">
      <div class="exercise-heading-tags">
        <span class="tag tag-level-section">Telc \${esc(model.exercise.level||'B2')} · Sprechen</span>
        <span class="tag tag-teil">\${esc(teil)}</span>
      </div>
    </div>
    <div class="exercise-heading-title">
      <div class="thema-title-row">
        <h1 id="thema-title" data-content-id="thema-title" data-source="\${esc(model.exercise.title||'')}" class="\${titleRevealed?'':'thema-title-hidden'}">\${esc(model.exercise.title)}</h1>
        <div class="thema-tools">
          \${textTools(model.exercise.title,'thema-title')}
          <div class="inline-translation" id="thema-title-translation"></div>
          <button type="button" class="mini-tool title-reveal" id="titleReveal" aria-label="\${text('إظهار العنوان','Titel anzeigen')}"><span class="eye-icon eye-off"></span></button>
        </div>
      </div>
    </div>
  </div>`;

if (html.includes(oldSpeaking1)) {
  html = html.replace(oldSpeaking1, newSpeaking1);
  console.log('Speaking heading 1 updated!');
}
if (html.includes(oldSpeaking2)) {
  html = html.replace(oldSpeaking2, newSpeaking2);
  console.log('Speaking heading 2 updated!');
}

// 3. Update layout() function
const oldLayoutRegex = /function layout\(main,side,workspaceClass=''\)\{[\s\S]*?return `<div class="exercise-heading">[\s\S]*?<\/div><\/div>`;\s*\}/;
const newLayoutCode = `function layout(main,side,workspaceClass=''){
 const isHoeren = String(model?.exercise?.section||'').toLowerCase().includes('hör') || String(model?.exercise?.section||'').toLowerCase().includes('hoer');
 const combinedWorkspaceClass = [workspaceClass, isHoeren ? 'hoeren-workspace' : ''].filter(Boolean).join(' ');
 const mockTitle=mockMode?'':\`<div class="thema-title-row"><h1 id="thema-title" data-content-id="thema-title" data-source="\${esc(model.exercise.title||'')}" class="\${titleRevealed?'':'thema-title-hidden'}">\${esc(model.exercise.title)}</h1><div class="thema-tools">\${textTools(model.exercise.title,'thema-title')}<div class="inline-translation" id="thema-title-translation"></div><button type="button" class="mini-tool title-reveal" id="titleReveal" aria-label="\${text('إظهار العنوان','Titel anzeigen')}" title="\${text('إظهار العنوان','Titel anzeigen')}"><span class="eye-icon eye-off" aria-hidden="true"></span></button></div></div>\`;
 const headingTools=mockMode?'':mockTitle;
 const activeDuration = duration || (model?.exercise ? getTelcDurationSeconds(model.exercise) : 1200);
 const initialMin = String(Math.floor(activeDuration / 60)).padStart(2, '0');
 const timer=(mockMode||activeDuration)?\`<div class="progress-pill \${mockMode?'mock-global-timer':''}" id="timerEl"><span class="timer-icon" aria-hidden="true">⏱️</span> <span class="timer-digits">\${initialMin}:00</span></div>\`:'';
 const resultPanel=resultData?\`<div class="inline-result-panel \${resultData.percent>=60?'pass':'fail'}"><div class="result-panel-main"><span class="result-panel-label">\${text('النتيجة','Ergebnis')}</span><strong>\${resultData.score} / \${resultData.max}</strong></div><div class="result-panel-meta"><span>\${resultData.percent}%</span><b>\${esc(resultData.result||'')}</b></div></div>\`:'';
 
 const headingMeta = \`
  <div class="exercise-heading-meta">
    <div class="exercise-heading-tags">
      <span class="tag tag-level-section">Telc \${esc(model.exercise.level||'B2')} · \${esc(model.exercise.section)}</span>
      <span class="tag tag-teil">\${esc(model.exercise.teil)}</span>
    </div>
    \${timer ? \`<div class="exercise-heading-timer">\${timer}</div>\` : ''}
  </div>\`;

 return \`<div class="exercise-heading">
  \${headingMeta}
  <div class="exercise-heading-title">\${headingTools}</div>
  \${renderAudio()}
 </div>
 \${resultPanel}
 <div class="exam-workspace \${combinedWorkspaceClass}">
   <section class="exam-main">\${main}</section>
 </div>
 <div class="exercise-actions">
   <div class="exercise-nav">
     <button class="btn" id="checkBtn">\${text(mockMode?'إنهاء الجزء':'تحقق من الإجابات',mockMode?'Teil beenden':'Antworten prüfen')}</button>
     \${mockMode?'':\`<button class="btn model-btn" id="modelBtn">\${text(showModelAnswers ? 'إخفاء الإجابة' : 'الإجابة النموذجية', showModelAnswers ? 'Musterlösung ausblenden' : 'Musterlösung')}</button>\`}
   </div>
 </div>\`;
}`;

if (oldLayoutRegex.test(html)) {
  html = html.replace(oldLayoutRegex, newLayoutCode);
  console.log('layout() function updated!');
} else {
  console.warn('layout() regex did not match!');
}

// 4. Update timer ticks
const oldTimerTick = `    const remaining = Math.max(0, Math.ceil((exerciseTimerEnd - Date.now()) / 1000));
    curEl.textContent = String(Math.floor(remaining / 60)).padStart(2, '0') + ':' + String(remaining % 60).padStart(2, '0');`;
const newTimerTick = `    const remaining = Math.max(0, Math.ceil((exerciseTimerEnd - Date.now()) / 1000));
    const timeStr = String(Math.floor(remaining / 60)).padStart(2, '0') + ':' + String(remaining % 60).padStart(2, '0');
    curEl.innerHTML = \`<span class="timer-icon" aria-hidden="true">⏱️</span> <span class="timer-digits">\${timeStr}</span>\`;`;

if (html.includes(oldTimerTick)) {
  html = html.replace(oldTimerTick, newTimerTick);
  console.log('startExerciseTimer() tick updated!');
}

const oldMockTick = `const tick=()=>{const n=mockRemaining();el.textContent=String(Math.floor(n/60)).padStart(2,'0')+':'+String(n%60).padStart(2,'0');el.classList.toggle('timer-danger',n<=60);if(n>0)window.setTimeout(tick,250);else finishMockSession();};`;
const newMockTick = `const tick=()=>{const n=mockRemaining();const timeStr=String(Math.floor(n/60)).padStart(2,'0')+':'+String(n%60).padStart(2,'0');el.innerHTML=\`<span class="timer-icon" aria-hidden="true">⏱️</span> <span class="timer-digits">\${timeStr}</span>\`;el.classList.toggle('timer-danger',n<=60);if(n>0)window.setTimeout(tick,250);else finishMockSession();};`;

if (html.includes(oldMockTick)) {
  html = html.replace(oldMockTick, newMockTick);
  console.log('startMockTimer() tick updated!');
}

// 5. Update paragraph-assignment structure
const oldParaAssign = `    return \`<article class="exam-text-card \${selected?'answered':''} \${resultClass} \${String(activeItem)===String(it.position_no)?'active-item':''}" data-item="\${it.position_no}">
      <div class="paragraph-assignment" style="margin-bottom:14px;padding-bottom:14px;border-bottom:1px dashed var(--line);">
        <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:8px;gap:8px;flex-wrap:wrap;">
          <div class="assignment-label" style="font-weight:900;color:var(--primary);">\${assignLabel}</div>
          <div class="exam-card-top" style="margin:0;">\${textTools(it.prompt,cid)}</div>
        </div>
        <select data-paragraph-select="\${it.position_no}" aria-label="\${assignLabel}"><option value="">\${assignPlaceholder}</option>\${selectOptions}</select>
        \${shownLabel?\`<button type="button" class="assignment-selected" data-clear="\${it.position_no}" aria-label="\${text('إلغاء الاختيار','Auswahl löschen')}"><span>\${esc(shownLabel)}</span><b>×</b></button>\`:\`<span class="assignment-empty">\${text('لم يتم الاختيار بعد','Noch nicht ausgewählt')}</span>\`}
      </div>
      <div class="exam-text" id="\${cid}" data-content-id="\${cid}" data-source="\${esc(it.prompt)}">\${escBody(it.prompt)}</div>
      <div class="inline-translation" id="\${cid}-translation"></div>
    </article>\`;`;

const newParaAssign = `    return \`<article class="exam-text-card \${selected?'answered':''} \${resultClass} \${String(activeItem)===String(it.position_no)?'active-item':''}" data-item="\${it.position_no}">
      <div class="paragraph-assignment">
        <div class="paragraph-assignment-head">
          <span class="assignment-label">\${assignLabel}</span>
          <div class="paragraph-assignment-tools">\${textTools(it.prompt,cid)}</div>
        </div>
        <div class="paragraph-assignment-controls">
          <select data-paragraph-select="\${it.position_no}" aria-label="\${assignLabel}"><option value="">\${assignPlaceholder}</option>\${selectOptions}</select>
          \${shownLabel?\`<button type="button" class="assignment-selected" data-clear="\${it.position_no}" aria-label="\${text('إلغاء الاختيار','Auswahl löschen')}"><span>\${esc(shownLabel)}</span><b>×</b></button>\`:\`<span class="assignment-empty">\${text('لم يتم الاختيار بعد','Noch nicht ausgewählt')}</span>\`}
        </div>
      </div>
      <div class="exam-text" id="\${cid}" data-content-id="\${cid}" data-source="\${esc(it.prompt)}">\${escBody(it.prompt)}</div>
      <div class="inline-translation" id="\${cid}-translation"></div>
    </article>\`;`;

if (html.includes(oldParaAssign)) {
  html = html.replace(oldParaAssign, newParaAssign);
  console.log('paragraph-assignment structure updated!');
} else {
  console.log('paragraph-assignment direct match failed, checking regex...');
  const paraAssignRegex = /<div class="paragraph-assignment" style="margin-bottom:14px;padding-bottom:14px;border-bottom:1px dashed var\(--line\);">[\s\S]*?<\/div>\s*<div class="exam-text"/;
  if (paraAssignRegex.test(html)) {
    const replacement = `<div class="paragraph-assignment">
        <div class="paragraph-assignment-head">
          <span class="assignment-label">\${assignLabel}</span>
          <div class="paragraph-assignment-tools">\${textTools(it.prompt,cid)}</div>
        </div>
        <div class="paragraph-assignment-controls">
          <select data-paragraph-select="\${it.position_no}" aria-label="\${assignLabel}"><option value="">\${assignPlaceholder}</option>\${selectOptions}</select>
          \${shownLabel?\`<button type="button" class="assignment-selected" data-clear="\${it.position_no}" aria-label="\${text('إلغاء الاختيار','Auswahl löschen')}"><span>\${esc(shownLabel)}</span><b>×</b></button>\`:\`<span class="assignment-empty">\${text('لم يتم الاختيار بعد','Noch nicht ausgewählt')}</span>\`}
        </div>
      </div>
      <div class="exam-text"`;
    html = html.replace(paraAssignRegex, replacement);
    console.log('paragraph-assignment updated via regex!');
  }
}

fs.writeFileSync('public/exercise.html', html, 'utf8');
console.log('public/exercise.html successfully written!');
