const fs = require('fs');

console.log('--- Applying Hidden Title & Lesen Teil 3 Updates ---');

// 1. Update public/exercise.html
let ex = fs.readFileSync('public/exercise.html', 'utf8');

// A. Fix Hidden Title
const oldHiddenTitleBlock = `        <div class="thema-title-row is-hidden-title">
          <div class="thema-masked-wrapper thema-blurred-card" id="titleMaskedBox" title="\${text('انقر لإظهار العنوان','Klicken zum Einblenden')}">
            <span class="thema-blurred-text" aria-hidden="true">\${esc(title)}</span>
            <div class="thema-blurred-badge">
              <span class="masked-lock-badge" aria-hidden="true">🔒</span>
              <span class="masked-hint">\${text('العنوان مخفي أثناء التدريب (انقر للإظهار)','Thema ausgeblendet (Klicken zum Anzeigen)')}</span>
            </div>
          </div>`;

const newHiddenTitleBlock = `        <div class="thema-title-row is-hidden-title">
          <div class="thema-masked-wrapper thema-blurred-card" id="titleMaskedBox" role="button" tabindex="0" title="\${text('انقر لإظهار العنوان','Klicken zum Einblenden')}" aria-label="\${text('انقر لإظهار العنوان','Klicken zum Einblenden')}">
            <span class="thema-blurred-text frosted-ghost-bars" aria-hidden="true">
              <span class="ghost-bar ghost-bar-long"></span>
              <span class="ghost-bar ghost-bar-short"></span>
            </span>
            <div class="thema-blurred-badge">
              <span class="masked-lock-badge" aria-hidden="true">🔒</span>
              <span class="masked-hint">\${text('العنوان مخفي أثناء التدريب (انقر للإظهار)','Thema ausgeblendet (Klicken zum Anzeigen)')}</span>
            </div>
          </div>`;

// Replace hidden title block
if (ex.includes(oldHiddenTitleBlock.replace(/\r?\n/g, '\r\n'))) {
  ex = ex.replace(oldHiddenTitleBlock.replace(/\r?\n/g, '\r\n'), newHiddenTitleBlock.replace(/\r?\n/g, '\r\n'));
  console.log('✓ Hidden title successfully replaced (CRLF)');
} else if (ex.includes(oldHiddenTitleBlock.replace(/\r?\n/g, '\n'))) {
  ex = ex.replace(oldHiddenTitleBlock.replace(/\r?\n/g, '\n'), newHiddenTitleBlock.replace(/\r?\n/g, '\n'));
  console.log('✓ Hidden title successfully replaced (LF)');
} else {
  console.error('✗ Failed to find oldHiddenTitleBlock');
}

// B. Remove lesen3ResultsCard and rearrange Lesen Teil 3:
// Find between `const isLesen3=model.exercise.section==='Lesen'&&model.exercise.teil==='Teil 3';` and `const cards = matchingOrder.map`
const lesen3SectionStartIdx = ex.indexOf('const isLesen3=model.exercise.section===\'Lesen\'&&model.exercise.teil===\'Teil 3\';');
const cardsIdx = ex.indexOf('const cards = matchingOrder.map');

if (lesen3SectionStartIdx !== -1 && cardsIdx !== -1) {
  const targetOldChunk = ex.slice(lesen3SectionStartIdx, cardsIdx);
  
  const newLesen3Chunk = `const isLesen3=model.exercise.section==='Lesen'&&model.exercise.teil==='Teil 3';
  if(!matchingOrder)matchingOrder=items.map(it=>String(it.position_no));
  if(!headingOrder)headingOrder=heads.map((_,i)=>i);
  const usedAnswerIds=new Set(Object.values(answers).filter(Boolean).map(v=>matchingAnswerIdentity(v)));

  const bodySection = (bodyText && !isLesen3) ? \`
    <div class="long-text matching-reading-panel" style="margin-bottom:24px;">
      <div class="long-text-tools">\${textTools(bodyText, 'matching-main-body')}</div>
      <div class="long-text-content" id="matching-main-body" data-content-id="matching-main-body" data-source="\${esc(bodyText)}">\${escBody(bodyText)}</div>
      \${translationBox('matching-main-body-translation')}
    </div>
  \` : '';

  const lesen3AdsMarkup = isLesen3 ? \`
    <div class="lesen3-ads-section" style="margin-bottom:32px;">
      <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:16px;flex-wrap:wrap;gap:8px;">
        <h3 style="margin:0;font-size:19px;font-weight:900;display:flex;align-items:center;gap:8px;">
          <span>📰</span>
          <span>\${text('الإعلانات (12 إعلاناً — Anzeigen A bis L):','Anzeigen (Text A bis L):')}</span>
        </h3>
        <small class="muted">\${text('فوق كل إعلان قائمة لاختيار العنوان المناسب من قائمة العناوين بالأسفل (Titre 1 - 10 أو X):','Wählen Sie über jeder Anzeige die passende Überschrift aus der Liste unten aus:')}</small>
      </div>
      <div class="lesen3-ads-list" style="display:flex;flex-direction:column;gap:22px;">
        \${heads.map((h, i) => {
          const letter = String.fromCharCode(65 + i);
          const ad = parseAdText(h);
          const adCid = 'ad-text-' + letter;
          
          const assignedItem = items.find(it => String(answerValue(it.position_no)).toUpperCase() === letter);
          const selectedSitNo = assignedItem ? String(assignedItem.position_no) : '';
          
          let resultClass = '';
          const correctItem = items.find(it => String(it.correct_answer || '').toUpperCase() === letter);
          const expectedAnswer = correctItem ? String(correctItem.position_no) : 'X';
          if (resultData) {
            const isMatch = selectedSitNo && selectedSitNo.toUpperCase() === expectedAnswer.toUpperCase();
            resultClass = isMatch ? 'answer-correct' : 'answer-wrong';
          }
          
          const activeSit = showModelAnswers && expectedAnswer ? expectedAnswer : selectedSitNo;
          const shownAnswer = activeSit;
          const shownLabel = shownAnswer ? (shownAnswer === 'X' ? text('X — إعلان بدون عنوان', 'X — Keine passende Überschrift') : \`Titre \${shownAnswer}\`) : '';

          const selectOptions = items.map(sit => {
            const sNo = String(sit.position_no);
            const isSelected = activeSit === sNo;
            const currentHolder = heads.map((_, hi) => String.fromCharCode(65 + hi)).find(l => l !== letter && String(answerValue(sNo)).toUpperCase() === l);
            const isUsed = Boolean(currentHolder);
            const preview = sit.prompt ? (sit.prompt.length > 55 ? sit.prompt.slice(0, 52) + '…' : sit.prompt) : '';
            return \`<option value="\${sNo}" \${isSelected ? 'selected' : ''} \${isUsed ? 'disabled' : ''}>Titre \${sNo}: \${esc(preview)}\${isUsed ? ' — ' + text('تم اختياره', 'Bereits ausgewählt') : ''}</option>\`;
          }).join('') + \`<option value="X" \${activeSit === 'X' ? 'selected' : ''}>\${text('X — إعلان بدون عنوان (لا يناسب أي عنوان)', 'X — Keine passende Anzeige')}</option>\`;

          const assignLabel = \`Text \${letter} — \` + text('مكان اختيار العنوان المناسب لهذا الإعلان:', 'Passende Überschrift für diese Anzeige:');
          const assignPlaceholder = text('— اختر العنوان المناسب لهذا الإعلان (1 - 10 أو X) —', '— Passende Überschrift auswählen (1 - 10 oder X) —');

          return \`
          <article class="exam-text-card lesen3-ad-card \${selectedSitNo ? 'answered' : ''} \${resultClass} \${showModelAnswers ? 'model-shown' : ''}" id="card-ad-\${letter}" style="background:var(--white);border:1.5px solid var(--line);border-radius:20px;padding:24px;box-shadow:var(--shadow-sm);display:flex;flex-direction:column;gap:14px;">
            <div class="paragraph-assignment">
              <div class="paragraph-assignment-head">
                <span class="assignment-label" style="font-weight:900;color:var(--ink);">\${assignLabel}</span>
                <div class="paragraph-assignment-tools">
                  <span class="ad-tag" style="background:#0f172a;color:#fff;font-weight:900;font-size:13px;padding:4px 12px;border-radius:8px;">Text \${letter}</span>
                  \${textTools(ad.body || ad.title, adCid)}
                </div>
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
            \${ad.title ? \`<h4 class="ad-title" style="margin:4px 0 6px;font-size:18px;font-weight:850;color:var(--green);">\${esc(ad.title)}</h4>\` : ''}
            <div class="exam-text ad-body" id="\${adCid}" data-content-id="\${adCid}" data-source="\${esc(ad.body || ad.title)}" style="font-size:15.5px;line-height:1.85;color:var(--ink);">\${escBody(ad.body || ad.title)}</div>
            <div class="inline-translation" id="\${adCid}-translation"></div>
          </article>\`;
        }).join('')}
      </div>
    </div>
  \` : '';

  `;
  
  ex = ex.replace(targetOldChunk, newLesen3Chunk.replace(/\n/g, targetOldChunk.includes('\r\n') ? '\r\n' : '\n'));
  console.log('✓ Lesen Teil 3 ads chunk replaced');
} else {
  console.error('✗ Failed to find lesen3SectionStartIdx or cardsIdx');
}

// C. Update `main` and `headingsBankUnder`
// Find `const main = isLesen3 ?`
const mainIdx = ex.indexOf('const main = isLesen3 ?');
const contentInnerHtmlIdx = ex.indexOf('document.getElementById(\'content\').innerHTML = layout(main + headingsBankUnder');

if (mainIdx !== -1 && contentInnerHtmlIdx !== -1) {
  const targetBottomChunk = ex.slice(mainIdx, contentInnerHtmlIdx);
  const isCRLF = targetBottomChunk.includes('\r\n');
  const eol = isCRLF ? '\r\n' : '\n';

  const newBottomChunk = `const main = isLesen3 ? \`
    \${lesen3AdsMarkup}
  \` : \`\${bodySection}\${cards}\`;

 const side=headingOrder.map(i=>({h:heads[i],i})).map(({h,i})=>{
   const key=String.fromCharCode(65+i);
   const displayHeading=matchingDisplayLabel(h,i);
   const identity=matchingAnswerIdentity(String(i+1));
   const owner=items.find(it=>{const v=answerValue(it.position_no); return v && matchingAnswerIdentity(v)===identity;});
   const ownerDetail=owner&&resultData?(resultData.details||[]).find(d=>String(d.prompt)===String(owner.prompt)):null;
   const modelDetail=(resultData?.details||[]).find(d=>String(d.correct_answer)===key);
   const modelOwner=modelDetail?items.find(it=>String(it.prompt)===String(modelDetail.prompt)):null;
   const selectedForActive=activeItem&&answerValue(activeItem)===key;
   const isUsed=!!owner && String(owner.position_no)!==String(activeItem||'');
   const resultClass=ownerDetail?(ownerDetail.ok?'result-correct':'result-wrong'):'';
   const modelClass=showModelAnswers&&modelOwner?'model-correct':'';
   const cid='head-'+key;
   return \`<div class="heading-option-wrap \${selectedForActive?'is-active-match':''} \${isUsed?'heading-used':''} \${selectedForActive?'heading-current':''}">
      <button type="button" class="choice-card \${selectedForActive?'selected':''} \${resultClass} \${modelClass}" data-choice="\${key}" \${isUsed&&!selectedForActive?'disabled':''}><b id="\${cid}" data-content-id="\${cid}" data-source="\${esc(displayHeading)}">\${esc(displayHeading)}</b>\${isUsed?\`<small class="heading-used-badge">✓ \${text('تم اختياره','Ausgewählt')}</small>\`:''}</button>
      \${textTools(displayHeading,cid)}
      <div class="inline-translation" id="\${cid}-translation"></div>
   </div>\`;
 }).join('');

 const answeredCount=Object.keys(answers).filter(k=>answers[k]).length;
 const meta=matchingMeta();
 const headingsBankUnder = isLesen3 ? \`
   <div class="matching-headings-bank lesen3-headings-overview" style="margin-top:36px;padding:24px;background:var(--white);border:1.5px solid var(--line);border-radius:20px;box-shadow:var(--shadow-sm);">
     <div class="matching-bank-head" style="display:flex;justify-content:space-between;align-items:center;margin-bottom:18px;flex-wrap:wrap;gap:12px;">
       <div>
         <h3 style="margin:0 0 4px;font-size:19px;font-weight:900;display:flex;align-items:center;gap:8px;">
           <span>📋</span>
           <span>\${text('قائمة العناوين (10 مواقف — Überschriften 1 bis 10):', 'Überschriften (1 bis 10):')}</span>
         </h3>
         <small style="color:var(--muted);font-size:13px;">\${text('اختر العنوان المناسب من القائمة المنسدلة أعلى كل إعلان فوق. إعلانان لا يناسبان أي عنوان (X).', 'Wählen Sie oben über jeder Anzeige die passende Überschrift aus dieser Liste aus.')}</small>
       </div>
       <div style="display:flex;align-items:center;gap:10px;">
         <span class="side-counter-pill">\${answeredCount} / \${items.length}</span>
       </div>
     </div>
     <div class="lesen3-headings-grid" style="display:grid;grid-template-columns:repeat(auto-fill, minmax(320px, 1fr));gap:12px;">
       \${items.map(it => {
         const assignedLetter = heads.map((_, hi) => String.fromCharCode(65 + hi)).find(l => String(answerValue(it.position_no)).toUpperCase() === l);
         const cid = 'sit-head-' + it.position_no;
         const detail = resultData ? (resultData.details || []).find(d => String(d.prompt) === String(it.prompt)) : null;
         const correctVal = String(detail?.correct_answer || it.correct_answer || '').trim().toUpperCase();
         const shownText = showModelAnswers && correctVal ? (correctVal === 'X' ? 'X' : \`Text \${correctVal}\`) : (assignedLetter ? \`Text \${assignedLetter}\` : '');
         const badgeClass = detail ? (detail.ok ? 'model-correct' : 'model-wrong') : '';
         return \`
         <div class="lesen3-heading-badge" style="background:var(--bg);border:1.5px solid var(--line);border-radius:14px;padding:14px 16px;box-shadow:var(--shadow-sm);display:flex;flex-direction:column;gap:6px;">
           <div style="display:flex;justify-content:space-between;align-items:center;">
             <strong style="font-weight:950;color:#f47b20;font-size:15px;">Titre \${it.position_no}</strong>
             \${shownText ? \`<span class="ad-status-pill \${badgeClass}" style="background:#0f172a;color:#fff;font-weight:900;font-size:12px;padding:3px 9px;border-radius:6px;">\${shownText}</span>\` : \`<small class="muted" style="font-size:11.5px;">\${text('غير محدد بعد','Noch offen')}</small>\`}
           </div>
           <div id="\${cid}" data-content-id="\${cid}" data-source="\${esc(it.prompt)}" style="font-size:14.5px;line-height:1.6;color:var(--ink);">\${esc(it.prompt)}</div>
           <div style="display:flex;justify-content:flex-end;margin-top:2px;">
             \${textTools(it.prompt, cid)}
           </div>
           <div class="inline-translation" id="\${cid}-translation"></div>
         </div>\`;
       }).join('')}
     </div>
   </div>
 \` : \`
   <div class="matching-headings-bank" style="margin-top:32px;padding:0;background:transparent;border:0;border-radius:0;box-shadow:none;">
     <div class="matching-bank-head" style="display:flex;justify-content:space-between;align-items:center;margin-bottom:18px;flex-wrap:wrap;gap:12px;">
       <div>
         <h3 style="margin:0 0 4px;font-size:18px;font-weight:900;display:flex;align-items:center;gap:8px;">
           <span>🏷️</span>
           <span>\${esc(meta.title)} — \${text('العناوين المتاحة للمطابقة', 'Verfügbare Überschriften')}</span>
         </h3>
         <small style="color:var(--muted);font-size:12.5px;">\${text('يمكنك مراجعة جميع العناوين هنا أو الضغط على أي عنوان لاختياره مباشرة للفقرة المحددة.', 'Überschriften zur Auswahl für die Absätze.')}</small>
       </div>
       <div style="display:flex;align-items:center;gap:10px;">
         <span class="side-counter-pill">\${answeredCount} / \${items.length}</span>
       </div>
     </div>
     <div class="heading-list-grid" style="display:flex;flex-direction:column;gap:12px;">
       \${side}
     </div>
   </div>
 \`;

 `;
  
  ex = ex.replace(targetBottomChunk, newBottomChunk.replace(/\n/g, eol));
  console.log('✓ Bottom chunk and headingsBankUnder replaced');
} else {
  console.error('✗ Failed to find mainIdx or contentInnerHtmlIdx');
}

fs.writeFileSync('public/exercise.html', ex, 'utf8');
console.log('Saved public/exercise.html');

// 2. Update public/mock-exam.html (renderMockLesen3 and renderMockLesen1)
let mock = fs.readFileSync('public/mock-exam.html', 'utf8');

// In renderMockLesen3: make sure ads are on TOP, headings overview is UNDERNEATH all 12 ads
const mockL3Start = mock.indexOf('function renderMockLesen3(model){');
const mockL3End = mock.indexOf('function renderMockHoeren(model){');

if (mockL3Start !== -1 && mockL3End !== -1) {
  const targetMockL3 = mock.slice(mockL3Start, mockL3End);
  const isCRLF = targetMockL3.includes('\r\n');
  const eol = isCRLF ? '\r\n' : '\n';

  const newMockL3 = `function renderMockLesen3(model){
  window.__mockAnswers = {...itemAnswer(model.exercise.id)};
  const items = model.items || [];
  const heads = getExerciseHeadings(model);

  const headingsOverview = \`
    <div class="mock-headings-bank" style="margin-top:32px;">
      <h3><span>📋</span> <span>\${text('قائمة العناوين (10 عناوين — Überschriften 1 bis 10):', 'Überschriften (1 bis 10):')}</span></h3>
      <div class="mock-headings-list">
        \${items.map(it => {
          const assignedLetter = heads.map((_, hi) => String.fromCharCode(65 + hi)).find(l => String(window.__mockAnswers[String(it.position_no)] || window.__mockAnswers[String(it.id)] || '').toUpperCase() === l);
          return \`
          <div class="mock-heading-item">
            <span class="mock-heading-letter">Titre \${it.position_no}</span>
            <div style="flex:1;">
              <span>\${esc(it.prompt)}</span>
              \${assignedLetter ? \` <span style="background:#0f172a;color:#fff;font-weight:900;font-size:11px;padding:2px 7px;border-radius:6px;margin-inline-start:6px;">Text \${assignedLetter}</span>\` : ''}
            </div>
          </div>\`;
        }).join('')}
      </div>
    </div>\`;

  const adsListMarkup = heads.map((h, i) => {
    const letter = String.fromCharCode(65 + i);
    const ad = parseAdText(h);
    const assignedItem = items.find(it => String(window.__mockAnswers[String(it.position_no)] || window.__mockAnswers[String(it.id)] || '').toUpperCase() === letter);
    const selectedSitNo = assignedItem ? String(assignedItem.position_no) : '';

    const selectOptions = items.map(sit => {
      const sNo = String(sit.position_no);
      const isSelected = selectedSitNo === sNo;
      const currentHolder = heads.map((_, hi) => String.fromCharCode(65 + hi)).find(l => l !== letter && String(window.__mockAnswers[sNo] || window.__mockAnswers[String(sit.id)] || '').toUpperCase() === l);
      const isUsed = Boolean(currentHolder);
      const preview = sit.prompt ? (sit.prompt.length > 55 ? sit.prompt.slice(0, 52) + '…' : sit.prompt) : '';
      return \`<option value="\${sNo}" \${isSelected ? 'selected' : ''} \${isUsed ? 'disabled' : ''}>Titre \${sNo}: \${esc(preview)}\${isUsed ? ' — ' + text('تم اختياره', 'Bereits ausgewählt') : ''}</option>\`;
    }).join('') + \`<option value="X" \${selectedSitNo === 'X' ? 'selected' : ''}>\${text('X — إعلان بدون عنوان (لا يناسب أي عنوان)', 'X — Keine passende Anzeige')}</option>\`;

    return \`
    <article class="mock-item \${selectedSitNo ? 'answered' : ''}">
      <div class="mock-item-prompt" style="display:flex;align-items:center;justify-content:space-between;gap:10px;margin-bottom:12px;">
        <span style="background:#0f172a;color:#fff;font-weight:900;font-size:13px;padding:4px 12px;border-radius:8px;">Text \${letter}</span>
        <span style="font-size:13.5px;font-weight:850;color:var(--muted);">\${text('مكان اختيار العنوان لهذا الإعلان:','Überschrift für diesen Text:')}</span>
      </div>
      <div style="margin-bottom:14px;">
        <select class="mock-select \${selectedSitNo ? 'answered' : ''}" data-mock-ad-select="\${letter}" aria-label="Text \${letter}">
          <option value="">— \${text('اختر العنوان المناسب (Titre 1 - 10 أو X)', 'Passende Überschrift auswählen (Titre 1 - 10 oder X)')} —</option>
          \${selectOptions}
        </select>
      </div>
      \${ad.title ? \`<h4 style="margin:6px 0 8px;font-size:17px;font-weight:850;color:#2d9b68;">\${esc(ad.title)}</h4>\` : ''}
      <div class="mock-task-body" style="font-size:15.5px;line-height:1.8;">\${escBody(ad.body || ad.title)}</div>
    </article>\`;
  }).join('');

  return baseShell(\`
    <div class="mock-section-label">
      <span class="tag">Telc \${esc(model.exercise.level||state.session.level)}</span>
      <span class="mock-task-count">\${esc(model.exercise.section)} · \${esc(model.exercise.teil)}</span>
    </div>
    <div class="mock-spb-head" style="margin-top:14px;margin-bottom:16px;">
      <h3><span>📰</span> <span>\${text('الإعلانات (12 إعلاناً — Anzeigen A bis L):', 'Anzeigen (Text A bis L):')}</span></h3>
      <span class="mock-task-count">\${Object.keys(window.__mockAnswers).length} / \${items.length}</span>
    </div>
    <div style="display:flex;flex-direction:column;gap:18px;">
      \${adsListMarkup}
    </div>
    \${headingsOverview}
  \`);
}

`;

  mock = mock.replace(targetMockL3, newMockL3.replace(/\n/g, eol));
  console.log('✓ mock-exam.html renderMockLesen3 updated (ads on top, headings bank underneath)');
} else {
  console.error('✗ Failed to find mockL3Start or mockL3End');
}

// In renderMockLesen1: also ensure texts are on top and headings bank is underneath
const mockL1Start = mock.indexOf('function renderMockLesen1(model){');
const mockL1End = mock.indexOf('function renderMockLesen2(model){');

if (mockL1Start !== -1 && mockL1End !== -1) {
  const targetMockL1 = mock.slice(mockL1Start, mockL1End);
  const isCRLF = targetMockL1.includes('\r\n');
  const eol = isCRLF ? '\r\n' : '\n';

  const newMockL1 = `function renderMockLesen1(model){
  window.__mockAnswers = {...itemAnswer(model.exercise.id)};
  const items = model.items || [];
  const heads = getExerciseHeadings(model);
  const usedKeys = new Set(Object.values(window.__mockAnswers).filter(Boolean).map(v => String(v).toUpperCase()));

  const headingsBankMarkup = \`
    <div class="mock-headings-bank" style="margin-top:28px;">
      <h3><span>📋</span> <span>\${text('قائمة العناوين (Überschriften A bis J):', 'Überschriften (A bis J):')}</span></h3>
      <div class="mock-headings-list">
        \${heads.map((h, i) => {
          const letter = String.fromCharCode(65 + i);
          return \`
          <div class="mock-heading-item">
            <span class="mock-heading-letter">\${letter}</span>
            <span>\${esc(h)}</span>
          </div>\`;
        }).join('')}
      </div>
    </div>\`;

  const cardsMarkup = items.map((it, idx) => {
    const n = String(it.position_no);
    const val = String(window.__mockAnswers[n] || window.__mockAnswers[String(it.id)] || '').toUpperCase();
    const selectOptions = heads.map((h, i) => {
      const letter = String.fromCharCode(65 + i);
      const isSelected = val === letter;
      const isUsed = !isSelected && usedKeys.has(letter);
      return \`<option value="\${letter}" \${isSelected ? 'selected' : ''} \${isUsed ? 'disabled' : ''}>\${letter}: \${esc(h)}\${isUsed ? ' - ' + text('تم اختياره', 'bereits gewählt') : ''}</option>\`;
    }).join('');

    return \`
    <article class="mock-item \${val ? 'answered' : ''}">
      <div class="mock-item-prompt" style="display:flex;align-items:center;justify-content:space-between;gap:12px;margin-bottom:12px;">
        <strong>Text \${idx + 1}</strong>
      </div>
      <div style="margin-bottom:16px;">
        <select class="mock-select \${val ? 'answered' : ''}" data-answer-q="\${esc(n)}" aria-label="Text \${idx + 1}">
          <option value="">— \${text('اختر العنوان المناسب لهذا النص', 'Passende Überschrift auswählen')} —</option>
          \${selectOptions}
        </select>
      </div>
      <div class="mock-task-body" style="font-size:16px;line-height:1.8;">\${escBody(it.prompt || it.body || '')}</div>
    </article>\`;
  }).join('');

  return baseShell(\`
    <div class="mock-section-label">
      <span class="tag">Telc \${esc(model.exercise.level||state.session.level)}</span>
      <span class="mock-task-count">\${esc(model.exercise.section)} · \${esc(model.exercise.teil)}</span>
    </div>
    <div class="mock-spb-head" style="margin-top:14px;margin-bottom:16px;">
      <h3><span>📖</span> <span>\${text('النصوص (1 إلى 5):', 'Texte (1 bis 5):')}</span></h3>
      <span class="mock-task-count">\${Object.keys(window.__mockAnswers).length} / \${items.length}</span>
    </div>
    <div style="display:flex;flex-direction:column;gap:18px;">
      \${cardsMarkup}
    </div>
    \${headingsBankMarkup}
  \`);
}

`;

  mock = mock.replace(targetMockL1, newMockL1.replace(/\n/g, eol));
  console.log('✓ mock-exam.html renderMockLesen1 updated (texts on top, headings bank underneath)');
} else {
  console.error('✗ Failed to find mockL1Start or mockL1End');
}

fs.writeFileSync('public/mock-exam.html', mock, 'utf8');
console.log('Saved public/mock-exam.html');

// 3. Update public/assets/app.css for ghost shimmer bars and liquid eye button
let css = fs.readFileSync('public/assets/app.css', 'utf8');

const cssAdditions = `
/* Frosted Ghost bars for hidden title (zero leaked text) */
.exercise-header-card .frosted-ghost-bars {
  display: inline-flex !important;
  align-items: center !important;
  gap: 10px !important;
  filter: blur(2px) !important;
  -webkit-filter: blur(2px) !important;
  pointer-events: none !important;
  user-select: none !important;
  padding: 4px 2px !important;
}

.exercise-header-card .ghost-bar {
  display: inline-block !important;
  height: 18px !important;
  border-radius: 999px !important;
  background: linear-gradient(90deg, rgba(244, 123, 32, 0.22) 0%, rgba(244, 123, 32, 0.5) 50%, rgba(244, 123, 32, 0.22) 100%) !important;
  background-size: 200% 100% !important;
  animation: ghostShimmerBar 2.2s infinite ease-in-out !important;
}

.exercise-header-card .ghost-bar-long {
  width: clamp(120px, 16vw, 170px) !important;
}

.exercise-header-card .ghost-bar-short {
  width: clamp(70px, 9vw, 95px) !important;
}

@keyframes ghostShimmerBar {
  0% { background-position: 150% 0; }
  100% { background-position: -150% 0; }
}

html[data-theme="dark"] .exercise-header-card .ghost-bar {
  background: linear-gradient(90deg, rgba(244, 123, 32, 0.28) 0%, rgba(255, 170, 90, 0.6) 50%, rgba(244, 123, 32, 0.28) 100%) !important;
}

/* Crystal liquid eye button with crisp orange stroke */
.exercise-header-card .title-reveal-btn,
.exercise-header-card .title-eye-btn {
  display: inline-flex !important;
  align-items: center !important;
  justify-content: center !important;
  width: 42px !important;
  height: 42px !important;
  min-width: 42px !important;
  padding: 0 !important;
  border-radius: 12px !important;
  cursor: pointer !important;
  background: rgba(255, 255, 255, 0.75) !important;
  backdrop-filter: blur(14px) !important;
  -webkit-backdrop-filter: blur(14px) !important;
  border: 1.5px solid rgba(244, 123, 32, 0.4) !important;
  color: #f47b20 !important;
  box-shadow: 0 2px 10px rgba(244, 123, 32, 0.12) !important;
  transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1) !important;
}

html[data-theme="dark"] .exercise-header-card .title-reveal-btn,
html[data-theme="dark"] .exercise-header-card .title-eye-btn {
  background: rgba(30, 41, 59, 0.75) !important;
  border-color: rgba(244, 123, 32, 0.5) !important;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.3) !important;
}

.exercise-header-card .title-reveal-btn:hover,
.exercise-header-card .title-eye-btn:hover {
  border-color: #f47b20 !important;
  background: rgba(244, 123, 32, 0.18) !important;
  transform: scale(1.06) !important;
  box-shadow: 0 4px 16px rgba(244, 123, 32, 0.28) !important;
}

.exercise-header-card .title-eye-btn .eye-svg {
  display: block !important;
  stroke: #f47b20 !important;
}
`;

if (!css.includes('ghostShimmerBar')) {
  css += cssAdditions;
  fs.writeFileSync('public/assets/app.css', css, 'utf8');
  console.log('Saved public/assets/app.css');
} else {
  console.log('app.css already contains ghostShimmerBar');
}

console.log('--- ALL UPDATES APPLIED SUCCESSFULLY ---');
