const fs = require('fs');

console.log('=== Applying Mock Exam Showroom & Universal Shuffle Enhancements ===\n');

// 1. Update public/exercise.html
const exPath = 'public/exercise.html';
let exHtml = fs.readFileSync(exPath, 'utf8');

// Update isShuffleAllowed to include Lesen Teil 1, 2, 3, Hören Teil 1, 2, 3, Sprachbausteine Teil 1, 2, 3
const oldShuffleAllowed = `function isShuffleAllowed(sec, teil){
  if (sec === 'Lesen' && (teil === 'Teil 1' || teil === 'Teil 3')) return true;
  if (sec === 'Sprachbausteine' && teil === 'Teil 2') return true;
  if (sec === 'Hören' && (teil === 'Teil 1' || teil === 'Teil 3')) return true;
  return false;
}`;

const newShuffleAllowed = `function isShuffleAllowed(sec, teil){
  if (sec === 'Lesen' && ['Teil 1', 'Teil 2', 'Teil 3'].includes(teil)) return true;
  if (sec === 'Hören' && ['Teil 1', 'Teil 2', 'Teil 3'].includes(teil)) return true;
  if (sec === 'Sprachbausteine' && ['Teil 1', 'Teil 2', 'Teil 3'].includes(teil)) return true;
  if (sec !== 'Schreiben' && sec !== 'Sprechen' && model?.items?.length > 1) return true;
  return false;
}`;

if (exHtml.includes(oldShuffleAllowed)) {
  exHtml = exHtml.replace(oldShuffleAllowed, newShuffleAllowed);
  console.log('✓ Updated isShuffleAllowed in exercise.html');
} else {
  // Try pattern matching if exact text differs slightly
  const sIdx = exHtml.indexOf('function isShuffleAllowed(sec, teil){');
  if (sIdx !== -1) {
    const eIdx = exHtml.indexOf('function renderExerciseHeaderCard(){', sIdx);
    exHtml = exHtml.slice(0, sIdx) + newShuffleAllowed + '\n\n' + exHtml.slice(eIdx);
    console.log('✓ Replaced isShuffleAllowed by slice in exercise.html');
  }
}

// Enhance topShuffleCurrentExercise to ensure fallback and all cases
const oldTopShuffle = `function topShuffleCurrentExercise(){
  const sec=String(model?.exercise?.section||'');
  const teil=String(model?.exercise?.teil||'');
  const items=model?.items||[];
  if(sec==='Lesen' && teil==='Teil 1'){
    matchingOrder=shuffle(matchingOrder||items.map(it=>String(it.position_no)));
  }else if(sec==='Lesen' && teil==='Teil 3'){
    matchingOrder=shuffle(matchingOrder||items.map(it=>String(it.position_no)));
  }else if(sec==='Lesen' && teil==='Teil 2'){
    items.forEach(it=>{const n=String(it.position_no);optionOrders[n]=shuffle((it.options||[]).slice(0,3).map(o=>o.option_key));});
  }else if(sec==='Hören'){
    if(items.some(it=>(it.options||[]).some(o=>String(o.option_text||o.option_key).toLowerCase()==='richtig'||String(o.option_text||o.option_key).toLowerCase()==='falsch')) || String(model?.exercise?.task_type||'')==='AUDIO_TF'){
      hoerenOrder=shuffle(hoerenOrder||items.map((_,i)=>i));
    }else{
      items.forEach(it=>{const n=String(it.position_no);optionOrders[n]=shuffle((it.options||[]).slice(0,4).map(o=>o.option_key));});
    }
  }else if(sec==='Sprachbausteine' && teil==='Teil 1'){
    items.forEach(it=>{const n=String(it.position_no);optionOrders[n]=shuffle((it.options||[]).slice(0,3).map(o=>o.option_key));});
  }else if(sec==='Sprachbausteine' && teil==='Teil 2'){
    const opts=sharedOptions();
    wordOrder=shuffle((wordOrder||opts.map(([k])=>k)));
  }
  const st=captureExerciseScroll();
  rerenderExerciseStable(st);
}`;

const newTopShuffle = `function topShuffleCurrentExercise(){
  const sec=String(model?.exercise?.section||'');
  const teil=String(model?.exercise?.teil||'');
  const items=model?.items||[];
  if(sec==='Lesen' && (teil==='Teil 1' || teil==='Teil 3')){
    matchingOrder=shuffle(matchingOrder||items.map(it=>String(it.position_no)));
  }else if(sec==='Lesen' && teil==='Teil 2'){
    items.forEach(it=>{const n=String(it.position_no);optionOrders[n]=shuffle((it.options||[]).slice(0,3).map(o=>o.option_key));});
  }else if(sec==='Hören'){
    if(items.some(it=>(it.options||[]).some(o=>String(o.option_text||o.option_key).toLowerCase()==='richtig'||String(o.option_text||o.option_key).toLowerCase()==='falsch')) || String(model?.exercise?.task_type||'')==='AUDIO_TF'){
      hoerenOrder=shuffle(hoerenOrder||items.map((_,i)=>i));
    }else{
      items.forEach(it=>{const n=String(it.position_no);optionOrders[n]=shuffle((it.options||[]).slice(0,4).map(o=>o.option_key));});
    }
  }else if(sec==='Sprachbausteine' && teil==='Teil 1'){
    items.forEach(it=>{const n=String(it.position_no);optionOrders[n]=shuffle((it.options||[]).slice(0,3).map(o=>o.option_key));});
  }else if(sec==='Sprachbausteine' && (teil==='Teil 2' || teil==='Teil 3')){
    const opts=sharedOptions();
    wordOrder=shuffle((wordOrder||opts.map(([k])=>k)));
  }else{
    items.forEach(it=>{const n=String(it.position_no);if(it.options&&it.options.length) optionOrders[n]=shuffle(it.options.map(o=>o.option_key));});
  }
  const st=captureExerciseScroll();
  rerenderExerciseStable(st);
}`;

if (exHtml.includes(oldTopShuffle)) {
  exHtml = exHtml.replace(oldTopShuffle, newTopShuffle);
  console.log('✓ Updated topShuffleCurrentExercise in exercise.html');
}

fs.writeFileSync(exPath, exHtml, 'utf8');

// 2. Update public/mock-exam.html
const mockPath = 'public/mock-exam.html';
let mockHtml = fs.readFileSync(mockPath, 'utf8');

// A. Insert audio player helper functions in mock-exam.html if not present
if (!mockHtml.includes('function renderUnifiedAudioPlayer(')) {
  const audioHelpers = `
function formatAudioTime(seconds){
  const n=Number(seconds);
  if(!Number.isFinite(n)||n<0)return '0:00';
  return Math.floor(n/60)+':'+Math.floor(n%60).toString().padStart(2,'0');
}
function renderUnifiedAudioPlayer(audioUrl) {
  const hasAudio = Boolean(String(audioUrl || '').trim());
  if (!hasAudio) {
    return \`
      <div class="hoeren-audio-player-card is-unavailable" data-hoeren-player>
        <div class="hoeren-audio-unavailable" role="status">
          <span class="hoeren-audio-unavailable-icon" aria-hidden="true">♪</span>
          <div>
            <strong>\${text('الصوت غير متوفر', 'Audio nicht verfügbar')}</strong>
            <small>\${text('لا يوجد ملف صوتي لهذا الامتحان حالياً.', 'Für diese Prüfung ist derzeit keine Audiodatei verfügbar.')}</small>
          </div>
        </div>
      </div>\`;
  }
  return \`
    <div class="hoeren-audio-player-card" data-hoeren-player>
      <audio class="hoeren-native-audio" preload="metadata" src="\${esc(audioUrl)}"></audio>
      <div class="hoeren-audio-controls-group">
        <button type="button" class="hoeren-audio-play" data-audio-play aria-label="\${text('تشغيل الصوت','Audio abspielen')}" title="\${text('تشغيل / إيقاف مؤقت','Abspielen / Pause')}">
          <span class="hoeren-audio-play-icon" aria-hidden="true">▶</span>
        </button>
        <button type="button" class="hoeren-audio-icon-btn hoeren-audio-skip-btn" data-audio-skip="-5" title="\${text('تراجع 5 ثوانٍ','5s zurück')}" aria-label="\${text('تراجع 5 ثوانٍ','5s zurück')}">
          <span>↺ 5s</span>
        </button>
        <button type="button" class="hoeren-audio-icon-btn hoeren-audio-skip-btn" data-audio-skip="5" title="\${text('تقدم 5 ثوانٍ','5s vor')}" aria-label="\${text('تقدم 5 ثوانٍ','5s vor')}">
          <span>5s ↻</span>
        </button>
      </div>
      <div class="hoeren-audio-main">
        <div class="hoeren-audio-topline">
          <span class="hoeren-audio-label">\${text('الملف الصوتي TELC Hören','Audiodatei TELC Hören')}</span>
          <span class="hoeren-audio-time"><span data-audio-current>0:00</span><span> / </span><span data-audio-duration>0:00</span></span>
        </div>
        <input class="hoeren-audio-progress" data-audio-progress type="range" min="0" max="100" value="0" step="0.1" aria-label="\${text('تقدم الصوت','Audiofortschritt')}">
      </div>
      <div class="hoeren-audio-actions">
        <button type="button" class="hoeren-audio-icon-btn hoeren-audio-speed-btn" data-audio-speed title="\${text('سرعة التشغيل: 1x / 0.8x / 1.2x','Wiedergabegeschwindigkeit')}">
          <span data-audio-speed-label>1x</span>
        </button>
        <button type="button" class="hoeren-audio-icon-btn" data-audio-mute aria-label="\${text('كتم الصوت','Stummschalten')}" title="\${text('كتم الصوت','Stummschalten')}">
          <span data-audio-volume-icon aria-hidden="true">🔊</span>
        </button>
        <input class="hoeren-audio-volume" data-audio-volume type="range" min="0" max="1" value="1" step="0.05" aria-label="\${text('مستوى الصوت','Lautstärke')}">
      </div>
    </div>\`;
}
function bindHoerenAudioPlayer(){
  const cards=document.querySelectorAll('[data-hoeren-player]');
  cards.forEach(card => {
    const audio=card.querySelector('.hoeren-native-audio');
    const play=card.querySelector('[data-audio-play]');
    const icon=card.querySelector('.hoeren-audio-play-icon');
    const progress=card.querySelector('[data-audio-progress]');
    const current=card.querySelector('[data-audio-current]');
    const durationEl=card.querySelector('[data-audio-duration]');
    const mute=card.querySelector('[data-audio-mute]');
    const volume=card.querySelector('[data-audio-volume]');
    const volumeIcon=card.querySelector('[data-audio-volume-icon]');
    const speedBtn=card.querySelector('[data-audio-speed]');
    const speedLabel=card.querySelector('[data-audio-speed-label]');
    const skipBtns=card.querySelectorAll('[data-audio-skip]');
    if(!audio||!play)return;
    const markUnavailable=()=>{
      card.classList.add('is-unavailable');
      card.innerHTML = \`<div class="hoeren-audio-unavailable" role="status"><span class="hoeren-audio-unavailable-icon" aria-hidden="true">♪</span><div><strong>\${text('الصوت غير متوفر','Audio nicht verfügbar')}</strong><small>\${text('تعذر تحميل الملف الصوتي لهذا الامتحان.','Die Audiodatei für diese Prüfung konnte nicht geladen werden.')}</small></div></div>\`;
    };
    audio.addEventListener('error', markUnavailable, {once:true});
    const sync=()=>{ if(card.classList.contains('is-unavailable')) return;
      const dur=Number.isFinite(audio.duration)?audio.duration:0;
      current.textContent=formatAudioTime(audio.currentTime);
      durationEl.textContent=formatAudioTime(dur);
      const pct = dur ? (audio.currentTime / dur * 100) : 0;
      progress.value = pct;
      progress.style.background = \`linear-gradient(to right, var(--green) 0%, var(--green) \${pct}%, var(--line) \${pct}%, var(--line) 100%)\`;
      icon.textContent=audio.paused?'▶':'❚❚';
      card.classList.toggle('is-playing',!audio.paused);
      play.setAttribute('aria-label',audio.paused?text('تشغيل الصوت','Audio abspielen'):text('إيقاف مؤقت','Pause'));
    };
    const syncVolume=()=>{
      const v=audio.muted?0:audio.volume;
      if (volume) {
        volume.value=v;
        const vPct = v * 100;
        volume.style.background = \`linear-gradient(to right, var(--green) 0%, var(--green) \${vPct}%, var(--line) \${vPct}%, var(--line) 100%)\`;
      }
      if (volumeIcon) volumeIcon.textContent=v===0?'🔇':v<.5?'🔉':'🔊';
    };
    play.onclick=()=>audio.paused?audio.play().catch(()=>{}):audio.pause();
    audio.addEventListener('loadedmetadata',sync); audio.addEventListener('timeupdate',sync); audio.addEventListener('play',sync); audio.addEventListener('pause',sync); audio.addEventListener('ended',sync);
    progress.oninput=()=>{if(Number.isFinite(audio.duration))audio.currentTime=Number(progress.value)/100*audio.duration;};
    if (volume) volume.oninput=()=>{audio.muted=false;audio.volume=Number(volume.value);syncVolume();};
    if (mute) mute.onclick=()=>{audio.muted=!audio.muted;syncVolume();};
    if (speedBtn) {
      const speeds = [1, 1.2, 0.8];
      let sIdx = 0;
      speedBtn.onclick=()=>{
        sIdx = (sIdx + 1) % speeds.length;
        audio.playbackRate = speeds[sIdx];
        if (speedLabel) speedLabel.textContent = speeds[sIdx] + 'x';
      };
    }
    skipBtns.forEach(sb => {
      sb.onclick=()=>{
        const delta = Number(sb.dataset.audioSkip || 0);
        if (Number.isFinite(audio.currentTime)) audio.currentTime = Math.max(0, Math.min(audio.duration || 0, audio.currentTime + delta));
      };
    });
    sync();
    syncVolume();
  });
}
`;
  const insertMarker = 'function getExerciseHeadings(model){';
  mockHtml = mockHtml.replace(insertMarker, audioHelpers + '\n' + insertMarker);
  console.log('✓ Inserted renderUnifiedAudioPlayer and bindHoerenAudioPlayer in mock-exam.html');
}

// B. Replace renderMockLesen2 to match exercise showroom (liquid-glass reading text + question cards + side-option buttons)
const sL2 = mockHtml.indexOf('function renderMockLesen2(model){');
const eL2 = mockHtml.indexOf('function renderMockLesen3(model){');

if (sL2 !== -1 && eL2 !== -1) {
  const newRenderMockLesen2 = `function renderMockLesen2(model){
  window.__mockAnswers = {...itemAnswer(model.exercise.id)};
  const items = (model.items || []).slice(0, 5);
  const bodyText = getExerciseBody(model);

  const questionsMarkup = items.map((it, idx) => {
    const n = String(it.position_no);
    const val = window.__mockAnswers[n] || window.__mockAnswers[String(it.id)] || '';
    const opts = (it.options || []).slice(0, 3);

    return \`
    <div class="lesen2-question \${val ? 'answered' : ''}" data-item="\${esc(n)}" style="background:var(--white);border:1.5px solid var(--line);border-radius:20px;padding:22px 24px;box-shadow:var(--shadow-sm);margin-bottom:18px;">
      <div class="question-prompt-row" style="display:flex;justify-content:space-between;align-items:flex-start;gap:12px;margin-bottom:16px;">
        <div class="question-prompt-text" style="font-size:16px;font-weight:850;line-height:1.6;color:var(--ink);">
          <span class="question-num" style="display:inline-flex;align-items:center;justify-content:center;width:28px;height:28px;background:var(--green-soft);color:var(--green-dark);border-radius:8px;margin-inline-end:10px;font-size:13.5px;font-weight:900;">\${it.position_no}</span>
          <span>\${esc(it.prompt || '')}</span>
        </div>
      </div>
      <div class="options-list" style="display:flex;flex-direction:column;gap:10px;">
        \${opts.map(o => {
          const isSelected = String(val).toLowerCase() === String(o.option_key).toLowerCase();
          return \`
          <div class="option-row">
            <button type="button" class="side-option mock-option \${isSelected ? 'selected' : ''}" data-answer-q="\${esc(n)}" data-answer="\${esc(o.option_key)}" style="width:100%;text-align:start;justify-content:flex-start;padding:12px 18px;border-radius:12px;font-size:14.5px;font-weight:750;background:var(--bg);color:var(--ink);border:\${isSelected ? '2.5px solid var(--green)' : '1.5px solid var(--line)'};box-shadow:\${isSelected ? '0 0 0 1px var(--green)' : 'none'};cursor:pointer;">
              <span class="option-text"><span class="mock-option-key" style="font-weight:900;color:var(--green-dark);margin-inline-end:6px;">\${esc(o.option_key)})</span> \${esc(o.option_text || o.option_key)}</span>
            </button>
          </div>\`;
        }).join('')}
      </div>
    </div>\`;
  }).join('');

  return baseShell(\`
    <div class="mock-section-label">
      <span class="tag">Telc \${esc(model.exercise.level||state.session.level)}</span>
      <span class="mock-task-count">\${esc(model.exercise.section)} · \${esc(model.exercise.teil)}</span>
    </div>
    <div class="long-text lesen2-long-text mock-reading-panel" style="margin-bottom:24px;background:var(--white);border:1.5px solid var(--line);border-radius:20px;padding:26px;box-shadow:var(--shadow-sm);backdrop-filter:blur(16px);font-size:16px;line-height:1.9;color:var(--ink);">
      <div class="long-text-content">\${escBody(bodyText)}</div>
    </div>
    <div class="mock-spb-head" style="margin-top:24px;margin-bottom:16px;">
      <h3><span>📝</span> <span>\${text('أسئلة الاختيار من متعدد (6 إلى 10):', 'Aufgaben zum Text (6 bis 10):')}</span></h3>
      <span class="mock-task-count">\${Object.keys(window.__mockAnswers).length} / \${items.length}</span>
    </div>
    <div class="lesen2-questions-list" style="display:flex;flex-direction:column;gap:6px;">
      \${questionsMarkup}
    </div>
  \`);
}`;
  mockHtml = mockHtml.slice(0, sL2) + newRenderMockLesen2 + '\n\n' + mockHtml.slice(eL2);
  console.log('✓ Updated renderMockLesen2 in mock-exam.html');
}

// C. Replace renderMockHoeren to match showroom (unified player + official TELC table)
const sH = mockHtml.indexOf('function renderMockHoeren(model){');
const eH = mockHtml.indexOf('/* ─── 7. Generic Choice Question Fallback ─── */');

if (sH !== -1 && eH !== -1) {
  const newRenderMockHoeren = `function renderMockHoeren(model){
  window.__mockAnswers = {...itemAnswer(model.exercise.id)};
  const items = model.items || [];
  const isTF = items.every(it => {
    const keys = (it.options || []).map(o => String(o.option_key||'').toLowerCase());
    return keys.length === 0 || keys.includes('richtig') || keys.includes('falsch');
  });

  const audioBox = renderUnifiedAudioPlayer(model.exercise.audio_url);

  let questionsMarkup = '';
  if (isTF) {
    questionsMarkup = \`
      <div class="hoeren-table-card" style="margin-top:24px;background:var(--white);border:1.5px solid var(--line);border-radius:20px;overflow:hidden;box-shadow:var(--shadow-sm);backdrop-filter:blur(16px);">
        <div class="hoeren-table-head" style="display:flex;align-items:center;padding:14px 20px;background:var(--bg);border-bottom:1.5px solid var(--line);font-weight:900;font-size:13.5px;color:var(--muted);">
          <div class="hoeren-th hoeren-th-r" style="width:80px;text-align:center;">\${text('صحيح','RICHTIG')}</div>
          <div class="hoeren-th hoeren-th-f" style="width:80px;text-align:center;">\${text('خطأ','FALSCH')}</div>
          <div class="hoeren-th hoeren-th-statement" style="flex:1;padding-inline-start:16px;">\${text('العبارة','AUSSAGE')}</div>
        </div>
        <div class="hoeren-table-body">
          \${items.map((it, idx) => {
            const n = String(it.position_no);
            const val = String(window.__mockAnswers[n] || window.__mockAnswers[String(it.id)] || '').toLowerCase();
            const isR = val === 'richtig';
            const isF = val === 'falsch';
            return \`
            <div class="hoeren-table-row \${val ? 'answered' : ''}" data-item="\${esc(n)}" style="display:flex;align-items:center;padding:16px 20px;border-bottom:1px solid var(--line);gap:8px;">
              <div class="hoeren-cell hoeren-cell-r" style="width:80px;display:flex;justify-content:center;">
                <button type="button" class="hoeren-circle-radio-btn \${isR ? 'selected' : ''}" data-answer-q="\${esc(n)}" data-answer="richtig" aria-label="\${idx + 1} Richtig" title="Richtig">
                  <span class="hoeren-circle-radio"></span>
                </button>
              </div>
              <div class="hoeren-cell hoeren-cell-f" style="width:80px;display:flex;justify-content:center;">
                <button type="button" class="hoeren-circle-radio-btn \${isF ? 'selected' : ''}" data-answer-q="\${esc(n)}" data-answer="falsch" aria-label="\${idx + 1} Falsch" title="Falsch">
                  <span class="hoeren-circle-radio"></span>
                </button>
              </div>
              <div class="hoeren-cell hoeren-cell-statement" style="flex:1;padding-inline-start:16px;">
                <div class="hoeren-stmt-content" style="display:flex;align-items:baseline;gap:8px;">
                  <span class="hoeren-stmt-num" style="font-weight:900;color:var(--green-dark);">\${idx + 1}.</span>
                  <span class="hoeren-stmt-text" style="font-size:15.5px;line-height:1.75;color:var(--ink);">\${esc(it.prompt)}</span>
                </div>
              </div>
            </div>\`;
          }).join('')}
        </div>
      </div>\`;
  } else {
    questionsMarkup = \`
      <div class="lesen2-questions-list" style="margin-top:24px;display:flex;flex-direction:column;gap:18px;">
        \${items.map((it, idx) => {
          const n = String(it.position_no);
          const val = String(window.__mockAnswers[n] || window.__mockAnswers[String(it.id)] || '').toLowerCase();
          const opts = it.options && it.options.length ? it.options : [{option_key:'a',option_text:'a'},{option_key:'b',option_text:'b'},{option_key:'c',option_text:'c'}];
          return \`
          <div class="lesen2-question \${val ? 'answered' : ''}" data-item="\${esc(n)}" style="background:var(--white);border:1.5px solid var(--line);border-radius:20px;padding:22px 24px;box-shadow:var(--shadow-sm);">
            <div class="question-prompt-row" style="display:flex;justify-content:space-between;align-items:flex-start;gap:12px;margin-bottom:16px;">
              <div class="question-prompt-text" style="font-size:16px;font-weight:850;line-height:1.6;color:var(--ink);">
                <span class="question-num" style="display:inline-flex;align-items:center;justify-content:center;width:28px;height:28px;background:var(--green-soft);color:var(--green-dark);border-radius:8px;margin-inline-end:10px;font-size:13.5px;font-weight:900;">\${idx + 1}</span>
                <span>\${esc(it.prompt || '')}</span>
              </div>
            </div>
            <div class="options-list" style="display:flex;flex-direction:column;gap:10px;">
              \${opts.map(o => {
                const isSelected = val === String(o.option_key).toLowerCase();
                return \`
                <div class="option-row">
                  <button type="button" class="side-option mock-option \${isSelected ? 'selected' : ''}" data-answer-q="\${esc(n)}" data-answer="\${esc(o.option_key)}" style="width:100%;text-align:start;justify-content:flex-start;padding:12px 18px;border-radius:12px;font-size:14.5px;font-weight:750;background:var(--bg);color:var(--ink);border:\${isSelected ? '2.5px solid var(--green)' : '1.5px solid var(--line)'};box-shadow:\${isSelected ? '0 0 0 1px var(--green)' : 'none'};cursor:pointer;">
                    <span class="option-text"><span class="mock-option-key" style="font-weight:900;color:var(--green-dark);margin-inline-end:6px;">\${esc(o.option_key)})</span> \${esc(o.option_text || o.option_key)}</span>
                  </button>
                </div>\`;
              }).join('')}
            </div>
          </div>\`;
        }).join('')}
      </div>\`;
  }

  return baseShell(\`
    <div class="mock-section-label">
      <span class="tag">Telc \${esc(model.exercise.level||state.session.level)}</span>
      <span class="mock-task-count">\${esc(model.exercise.section)} · \${esc(model.exercise.teil)}</span>
    </div>
    \${audioBox}
    <div class="mock-spb-head" style="margin-top:24px;margin-bottom:16px;">
      <h3><span>🎧</span> <span>\${text('أسئلة الاستماع:', 'Hörverstehensaufgaben:')}</span></h3>
      <span class="mock-task-count">\${Object.keys(window.__mockAnswers).length} / \${items.length}</span>
    </div>
    \${questionsMarkup}
  \`);
}`;
  mockHtml = mockHtml.slice(0, sH) + newRenderMockHoeren + '\n\n' + mockHtml.slice(eH);
  console.log('✓ Updated renderMockHoeren in mock-exam.html');
}

// Ensure bind() in mock-exam calls bindHoerenAudioPlayer()
if (!mockHtml.includes('bindHoerenAudioPlayer();')) {
  mockHtml = mockHtml.replace('function bind(){', 'function bind(){\n  bindHoerenAudioPlayer();');
  console.log('✓ Added bindHoerenAudioPlayer() call in bind() in mock-exam.html');
}

fs.writeFileSync(mockPath, mockHtml, 'utf8');

// 3. Update public/assets/app.css
const cssPath = 'public/assets/app.css';
let css = fs.readFileSync(cssPath, 'utf8');

const subBarCenteredCss = `
/* ==========================================================================
   CENTERED RESULT & RIGHT-ALIGNED SHUFFLE IN SUB-BAR
   ========================================================================== */
.exercise-header-card .exercise-sub-bar {
  display: flex !important;
  align-items: center !important;
  justify-content: center !important;
  text-align: center !important;
  gap: 16px !important;
  margin-top: 16px !important;
  width: 100% !important;
  flex-wrap: wrap !important;
}

.exercise-header-card .exercise-sub-items {
  display: flex !important;
  align-items: center !important;
  justify-content: center !important;
  gap: 16px !important;
  flex-wrap: wrap !important;
  margin: 0 auto !important;
}

.exercise-heading-shuffle {
  display: inline-flex !important;
  align-items: center !important;
  gap: 8px !important;
  padding: 8px 18px !important;
  border-radius: 999px !important;
  background: rgba(244, 123, 32, 0.08) !important;
  border: 1.5px solid rgba(244, 123, 32, 0.35) !important;
  color: #f47b20 !important;
  font-weight: 850 !important;
  font-size: 13.5px !important;
  cursor: pointer !important;
  backdrop-filter: blur(12px) !important;
  -webkit-backdrop-filter: blur(12px) !important;
  transition: all 0.2s ease !important;
}

.exercise-heading-shuffle:hover {
  background: rgba(244, 123, 32, 0.16) !important;
  border-color: #f47b20 !important;
  transform: translateY(-1px) !important;
}

.exercise-heading-shuffle .shuffle-icon {
  font-size: 16px !important;
  font-weight: 900 !important;
}

/* Strictly Center Result Panel */
.inline-result-panel {
  display: inline-flex !important;
  align-items: center !important;
  justify-content: center !important;
  text-align: center !important;
  margin: 0 auto !important;
}
`;

if (!css.includes('CENTERED RESULT & RIGHT-ALIGNED SHUFFLE IN SUB-BAR')) {
  css += '\n' + subBarCenteredCss;
  fs.writeFileSync(cssPath, css, 'utf8');
  console.log('✓ Successfully updated public/assets/app.css');
}

console.log('\n=== All Updates Applied Successfully ===');
