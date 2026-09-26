const fs = require('fs');
const mockPath = 'public/mock-exam.html';
let mockHtml = fs.readFileSync(mockPath, 'utf8');

const sH = mockHtml.indexOf('function renderMockHoeren(model){');
const eH = mockHtml.indexOf('/* ─── 7. Schreiben Renderer ─── */');

console.log('sH:', sH, 'eH:', eH);
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
  fs.writeFileSync(mockPath, mockHtml, 'utf8');
  console.log('✓ Successfully updated renderMockHoeren in mock-exam.html');
}
