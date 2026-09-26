const fs = require('fs');

console.log('--- Fixing Lesen Teil 3 Ad Card & Tool Layout ---');

// 1. Update public/exercise.html
let ex = fs.readFileSync('public/exercise.html', 'utf8');

// Find the ad card return template inside lesen3AdsMarkup
const adCardTemplateStart = ex.indexOf('const assignLabel = `Text ${letter} — `');
const adCardTemplateEnd = ex.indexOf('</article>`;', adCardTemplateStart) + '</article>`;'.length;

if (adCardTemplateStart !== -1 && adCardTemplateEnd !== -1) {
  const targetOld = ex.slice(adCardTemplateStart, adCardTemplateEnd);
  const isCRLF = targetOld.includes('\r\n');
  const eol = isCRLF ? '\r\n' : '\n';

  const targetNew = `const rawText = (typeof h === 'object') ? [h.title, h.body || h.text || h.content].filter(Boolean).join('\\n\\n') : String(h).trim();
          const assignLabel = text('العنوان المناسب للإعلان (' + letter + '):', 'Passende Überschrift für Text ' + letter + ':');
          const assignPlaceholder = text('— اختر العنوان المناسب لهذا الإعلان (1 - 10 أو X) —', '— Passende Überschrift auswählen (1 - 10 oder X) —');

          return \`
          <article class="exam-text-card lesen3-ad-card \${selectedSitNo ? 'answered' : ''} \${resultClass} \${showModelAnswers ? 'model-shown' : ''}" id="card-ad-\${letter}" style="background:var(--white);border:1.5px solid var(--line);border-radius:20px;padding:24px;box-shadow:var(--shadow-sm);display:flex;flex-direction:column;gap:14px;">
            <div class="paragraph-assignment">
              <div class="paragraph-assignment-head">
                <span class="assignment-label" style="font-weight:900;color:var(--ink);">\${assignLabel}</span>
                <div class="paragraph-assignment-tools">\${textTools(rawText, adCid)}</div>
              </div>
              <div class="paragraph-assignment-controls">
                <select data-ad-select="\${letter}" aria-label="\${assignLabel}" class="mock-select \${selectedSitNo ? 'answered' : ''}">
                  <option value="">\${assignPlaceholder}</option>
                  \${selectOptions}
                </select>
                \${shownLabel ? \`<button type="button" class="assignment-selected \${showModelAnswers ? 'model-correct' : ''}" data-ad-clear="\${letter}" aria-label="\${text('إلغاء الاختيار','Auswahl löschen')}"><span>\${esc(shownLabel)}</span>\${showModelAnswers ? '' : '<b>×</b>'}</button>\` : \`<span class="assignment-empty">\${text('لم يتم الاختيار بعد','Noch nicht ausgewählt')}</span>\`}
                \${(resultData && !showModelAnswers && expectedAnswer && selectedSitNo !== expectedAnswer) ? \`<span class="model-answer-hint" style="color:#2d9b68;font-size:13.5px;font-weight:850;display:inline-flex;align-items:center;gap:4px;padding:4px 10px;background:rgba(45,155,104,0.1);border-radius:8px;">\${text('الحل:','Lösung:')} \${expectedAnswer === 'X' ? 'X' : 'Titre ' + expectedAnswer}</span>\` : ''}
              </div>
            </div>
            <div class="exam-text ad-body" id="\${adCid}" data-content-id="\${adCid}" data-source="\${esc(rawText)}" style="font-size:15.5px;line-height:1.85;color:var(--ink);">\${escBody(rawText)}</div>
            <div class="inline-translation" id="\${adCid}-translation"></div>
          </article>\`;`;

  ex = ex.replace(targetOld, targetNew.replace(/\n/g, eol));
  fs.writeFileSync('public/exercise.html', ex, 'utf8');
  console.log('✓ Successfully updated public/exercise.html ad card layout');
} else {
  console.error('✗ Could not find adCardTemplate in public/exercise.html');
}

// 2. Update public/mock-exam.html
let mock = fs.readFileSync('public/mock-exam.html', 'utf8');

const mockCardStart = mock.indexOf('return `\n    <article class="mock-item ${selectedSitNo ? \'answered\' : \'\'}">') !== -1 
  ? mock.indexOf('return `\n    <article class="mock-item ${selectedSitNo ? \'answered\' : \'\'}">')
  : mock.indexOf('return `\r\n    <article class="mock-item ${selectedSitNo ? \'answered\' : \'\'}">');

const mockCardEnd = mock.indexOf('</article>`;', mockCardStart) + '</article>`;'.length;

if (mockCardStart !== -1 && mockCardEnd !== -1) {
  const targetMockOld = mock.slice(mockCardStart, mockCardEnd);
  const isCRLF = targetMockOld.includes('\r\n');
  const eol = isCRLF ? '\r\n' : '\n';

  const targetMockNew = `const rawText = (typeof h === 'object') ? [h.title, h.body || h.text || h.content].filter(Boolean).join('\\n\\n') : String(h).trim();
    return \`
    <article class="mock-item \${selectedSitNo ? 'answered' : ''}">
      <div class="mock-item-prompt" style="display:flex;align-items:center;justify-content:space-between;gap:12px;margin-bottom:12px;">
        <strong>Text \${letter}</strong>
      </div>
      <div style="margin-bottom:16px;">
        <select class="mock-select \${selectedSitNo ? 'answered' : ''}" data-mock-ad-select="\${letter}" aria-label="Text \${letter}">
          <option value="">— \${text('اختر العنوان المناسب لهذا الإعلان (1 - 10 أو X)', 'Passende Überschrift auswählen (1 - 10 oder X)')} —</option>
          \${selectOptions}
        </select>
      </div>
      <div class="mock-task-body" style="font-size:15.5px;line-height:1.8;">\${escBody(rawText)}</div>
    </article>\`;`;

  mock = mock.replace(targetMockOld, targetMockNew.replace(/\n/g, eol));
  fs.writeFileSync('public/mock-exam.html', mock, 'utf8');
  console.log('✓ Successfully updated public/mock-exam.html ad card layout');
} else {
  console.error('✗ Could not find mockCard in public/mock-exam.html');
}

// 3. Sync to github_update directories
const path = require('path');
const targets = ['E:\\\\telcvoll\\\\github_update', 'E:\\\\github_update_telcvoll'];
const syncFiles = [
  'public/exercise.html',
  'public/mock-exam.html'
];

for (const tgt of targets) {
  for (const f of syncFiles) {
    const src = path.join('E:\\\\telcvoll', f);
    const dst = path.join(tgt, f);
    fs.copyFileSync(src, dst);
  }
}
console.log('✓ Synced updated files to delivery directories');
