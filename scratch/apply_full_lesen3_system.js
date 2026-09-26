const fs = require('fs');

console.log('=== Applying Full Lesen Teil 3 & Universal Layout System ===\n');

// 1. Update public/exercise.html
const exPath = 'public/exercise.html';
let exHtml = fs.readFileSync(exPath, 'utf8');

const sMatching = exHtml.indexOf('function renderMatching(){');
const eMatching = exHtml.indexOf('function renderSprachbausteine1(){');

if (sMatching === -1 || eMatching === -1) {
  console.error('Marker for renderMatching not found!');
  process.exit(1);
}

const newRenderMatching = `function renderMatching(){
 const heads=getExerciseHeadings(model);
 const items=model.items||[];
 const bodyText=getExerciseBody(model);
 const isLesen3=model.exercise.section==='Lesen'&&model.exercise.teil==='Teil 3';
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

  const cards = matchingOrder.map(n=>items.find(it=>String(it.position_no)===n)).filter(Boolean).map(it=>{
    const selected=answerValue(it.position_no);
    const cid='para-'+it.position_no;
    const detail=resultData?(resultData.details||[]).find(d=>String(d.prompt)===String(it.prompt)):null;
    const correctVal=String(detail?.correct_answer||it.correct_answer||'').trim().toUpperCase();
    const shownAnswer=showModelAnswers&&correctVal?correctVal:selected;
    const shownLabel=shownAnswer?(isLesen3?(shownAnswer==='X'?text('X — لا يوجد عنوان مناسب','X — Keine passende Anzeige'):\`Text \${shownAnswer}\`):labelFor(it.position_no,shownAnswer)):'';
    const resultClass=detail?(detail.ok?'answer-correct':'answer-wrong'):'';
    
    let options = [];
    if (isLesen3) {
      options = heads.map((h, i) => {
        const letter = String.fromCharCode(65 + i);
        const ad = parseAdText(h);
        const fullTitle = ad.title ? ad.title : (ad.body ? ad.body.replace(/\\s+/g, ' ').trim() : '');
        const label = fullTitle ? \`Text \${letter}: \${fullTitle}\` : \`Text \${letter}\`;
        return { key: letter, text: label };
      });
      options.push({ key: 'X', text: text('X — لا يوجد عنوان مناسب لهذه الفقرة', 'X — Keine passende Anzeige') });
    } else {
      options = heads.map((h,i)=>({key:String.fromCharCode(65+i),text:matchingDisplayLabel(h,i)}));
    }

    const selectedIdentity=selected?matchingAnswerIdentity(selected):'';
    const selectOptions=options.map(o=>{
      const identity=matchingAnswerIdentity(o.key);
      const isX = isLesen3 && o.key.toUpperCase() === 'X';
      const used = !isX && usedAnswerIds.has(identity) && selectedIdentity !== identity;
      return \`<option value="\${esc(o.key)}" \${selected===o.key?'selected':''} \${used?'disabled':''}>\${esc(o.text)}\${used?' — '+text('تم اختياره','Bereits ausgewählt'):''}</option>\`;
    }).join('');
    
    const assignLabel = isLesen3 ? text(\`الموقف / الفقرة \${it.position_no} — اختر العنوان المناسب:\`, \`Absatz \${it.position_no} — Passende Überschrift / Anzeige:\`) : text('العنوان المناسب لهذه الفقرة:','Passende Überschrift für diesen Text:');
    const assignPlaceholder = isLesen3 ? text('— اختر العنوان المناسب لهذه الفقرة (Text A - L أو X) —','— Passende Anzeige auswählen (Text A - L oder X) —') : text('— اختر العنوان —','— Überschrift auswählen —');
    
    return \`<article class="exam-text-card \${selected?'answered':''} \${resultClass} \${showModelAnswers?'model-shown':''} \${String(activeItem)===String(it.position_no)?'active-item':''}" data-item="\${it.position_no}">
      <div class="paragraph-assignment">
         <div class="paragraph-assignment-head">
           <span class="assignment-label" style="font-weight:900;color:var(--ink);">\${assignLabel}</span>
           <div class="paragraph-assignment-tools">\${textTools(it.prompt,cid)}</div>
         </div>
         <div class="paragraph-assignment-controls">
           <select data-paragraph-select="\${it.position_no}" data-ad-select="\${it.position_no}" aria-label="\${assignLabel}" class="mock-select \${selected?'answered':''}">
             <option value="">\${assignPlaceholder}</option>
             \${selectOptions}
           </select>
           \${shownLabel?\`<button type="button" class="assignment-selected \${showModelAnswers?'model-correct':''}" data-clear="\${it.position_no}" aria-label="\${text('إلغاء الاختيار','Auswahl löschen')}"><span>\${esc(shownLabel)}</span>\${showModelAnswers?'':'<b>×</b>'}</button>\`:\`<span class="assignment-empty">\${text('لم يتم الاختيار بعد','Noch nicht ausgewählt')}</span>\`}
           \${(resultData && !showModelAnswers && correctVal && selected !== correctVal) ? \`<span class="model-answer-hint" style="color:#2d9b68;font-size:13.5px;font-weight:850;display:inline-flex;align-items:center;gap:4px;padding:4px 10px;background:rgba(45,155,104,0.1);border-radius:8px;">\${text('الحل:','Lösung:')} \${correctVal === 'X' ? text('X — لا يوجد عنوان مناسب','X — Keine passende Anzeige') : 'Text ' + correctVal}</span>\` : ''}
         </div>
       </div>
       <div class="exam-text paragraph-body" id="\${cid}" data-content-id="\${cid}" data-source="\${esc(it.prompt)}" style="font-size:15.5px;line-height:1.85;color:var(--ink);">\${escBody(it.prompt)}</div>
      <div class="inline-translation" id="\${cid}-translation"></div>
    </article>\`;
  }).join('');

  const main = \`\${bodySection}\${cards}\`;

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
   <div class="matching-headings-bank lesen3-headings-overview" style="margin-top:36px;padding:26px;background:var(--white);border:1.5px solid var(--line);border-radius:20px;box-shadow:var(--shadow-sm);">
     <div class="matching-bank-head" style="display:flex;justify-content:space-between;align-items:center;margin-bottom:18px;flex-wrap:wrap;gap:12px;">
       <div>
         <h3 style="margin:0 0 6px;font-size:19px;font-weight:900;display:flex;align-items:center;gap:8px;">
           <span>📰</span>
           <span>\${text('قائمة العناوين والإعلانات المتاحة (12 إعلاناً — Anzeigen A bis L):', 'Verfügbare Anzeigen (Text A bis L):')}</span>
         </h3>
         <small style="color:var(--muted);font-size:13.5px;line-height:1.6;">\${text('اقرأ الفقرات الـ 10 بالأعلى واختر لكل فقرة العنوان/الإعلان المناسب لها، أو اختر (X) إذا لم يكن لها عنوان مناسب. لا يمكن استخدام العنوان لأكثر من فقرة واحدة.', 'Wählen Sie oben für jeden Absatz die passende Anzeige aus, oder X wenn keine Anzeige passt. Jede Anzeige kann nur einmal zugeordnet werden.')}</small>
       </div>
       <div style="display:flex;align-items:center;gap:10px;">
         <span class="side-counter-pill">\${answeredCount} / \${items.length}</span>
       </div>
     </div>
     <div class="lesen3-ads-list" style="display:flex;flex-direction:column;gap:18px;">
       \${heads.map((h, i) => {
         const letter = String.fromCharCode(65 + i);
         const ad = parseAdText(h);
         const adCid = 'ad-text-' + letter;
         const assignedItem = items.find(it => String(answerValue(it.position_no)).toUpperCase() === letter);
         const assignedSitNo = assignedItem ? String(assignedItem.position_no) : '';
         const rawText = (typeof h === 'object') ? [h.title, h.body || h.text || h.content].filter(Boolean).join('\\n\\n') : String(h).trim();
         return \`
         <div class="heading-entry lesen3-ad-card \${assignedSitNo ? 'is-used' : ''}" id="card-ad-\${letter}" style="background:var(--bg);border:1.5px solid var(--line);border-radius:16px;padding:20px 22px;box-shadow:var(--shadow-sm);display:flex;flex-direction:column;gap:12px;">
           <div style="display:flex;justify-content:space-between;align-items:center;flex-wrap:wrap;gap:10px;">
             <strong style="font-size:16px;font-weight:950;color:#f47b20;display:inline-flex;align-items:center;gap:8px;">
               <span>Text \${letter}</span>
               \${ad.title ? \`<span style="color:var(--ink);font-weight:800;">— \${esc(ad.title)}</span>\` : ''}
             </strong>
             <div style="display:flex;align-items:center;gap:10px;">
               \${assignedSitNo ? \`<span class="badge" style="background:#0f172a;color:#fff;font-weight:800;font-size:12px;padding:4px 10px;border-radius:8px;">✓ \${text('مخصص للفقرة ' + assignedSitNo, 'Zugeordnet zu Absatz ' + assignedSitNo)}</span>\` : ''}
               \${textTools(rawText, adCid)}
             </div>
           </div>
           <div class="exam-text ad-body" id="\${adCid}" data-content-id="\${adCid}" data-source="\${esc(rawText)}" style="font-size:15px;line-height:1.85;color:var(--ink);white-space:normal;word-break:break-word;">\${escBody(ad.body || (ad.title ? '' : rawText))}</div>
           <div class="inline-translation" id="\${adCid}-translation"></div>
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

 document.getElementById('content').innerHTML = layout(main + headingsBankUnder, '', isLesen3 ? 'lesen3-workspace' : '');

 document.querySelectorAll('[data-item]').forEach(c=>{
   c.onmousedown=e=>{if(e.target.closest('select,.text-tools,.mini-tool,.clear-selection'))return;e.preventDefault();};
   c.onclick=e=>{if(e.target.closest('select,.text-tools,.mini-tool,.clear-selection'))return;activeItem=String(c.dataset.item);document.querySelectorAll('[data-item]').forEach(x=>x.classList.toggle('active-item',String(x.dataset.item)===activeItem));};
 });

  document.querySelectorAll('[data-paragraph-select]').forEach(sel=>{
   const refreshUniqueOptions=()=>{
     const selectedKeys=new Set([...document.querySelectorAll('[data-paragraph-select]')].filter(x=>x!==sel).map(x=>String(x.value||'')).filter(Boolean).map(matchingAnswerIdentity));
     [...sel.options].forEach(opt=>{
       if(!opt.value){opt.disabled=false;return;}
       if(opt.value==='X'||opt.value==='x'){opt.disabled=false;return;}
       const id=matchingAnswerIdentity(opt.value);
       opt.disabled=selectedKeys.has(id) && String(opt.value)!==String(sel.value||'');
     });
   };
   sel.addEventListener('focus',refreshUniqueOptions);
   refreshUniqueOptions();
 });
 document.querySelectorAll('[data-paragraph-select]').forEach(sel=>sel.onchange=e=>{
   e.stopPropagation(); const st=captureExerciseScroll();
   const n=String(sel.dataset.paragraphSelect), chosen=String(sel.value||'');
   activeItem=n;
   if(!chosen){
     delete answers[n];
   }else{
     if (chosen.toUpperCase() !== 'X') {
       const chosenId = matchingAnswerIdentity(chosen);
       Object.keys(answers).forEach(k => {
         if (k !== n && matchingAnswerIdentity(answers[k]) === chosenId) {
           delete answers[k];
         }
       });
     }
     answers[n]=chosen;
   }
   renderMatching();restoreExerciseScroll(st);bindActions();
 });
 document.querySelectorAll('[data-clear]').forEach(b=>b.onclick=e=>{e.stopPropagation();const st=captureExerciseScroll();delete answers[String(b.dataset.clear)];activeItem=String(b.dataset.clear);renderMatching();restoreExerciseScroll(st);bindActions();});
 document.querySelectorAll('[data-choice]').forEach(b=>{b.onmousedown=e=>e.preventDefault();b.onclick=e=>{e.preventDefault();if(b.disabled||!activeItem)return;const st=captureExerciseScroll();const chosen=b.dataset.choice;const chosenId=matchingAnswerIdentity(chosen);const duplicate=Object.entries(answers).some(([q,v])=>String(q)!==String(activeItem)&&matchingAnswerIdentity(v)===chosenId);if(duplicate){const msg=text('هذا الخيار مستخدم بالفعل في حقل آخر. اختر خياراً مختلفاً.','Diese Antwort wurde bereits einem anderen Feld zugeordnet. Bitte wählen Sie eine andere Antwort.');const existing=document.querySelector('.unique-answer-warning');if(existing)existing.remove();document.getElementById('content')?.insertAdjacentHTML('afterbegin',\`<div class="alert bad unique-answer-warning">\${esc(msg)}</div>\`);return;}answers[String(activeItem)]=chosen;renderMatching();restoreExerciseScroll(st);bindActions();};});
 const sh=document.getElementById('headingShuffleBtn');
 if(sh)sh.onclick=e=>{e.stopPropagation();const st=captureExerciseScroll();matchingOrder=shuffle(matchingOrder);activeItem=null;renderMatching();restoreExerciseScroll(st);bindActions();};
 bindTextTools();
}`;

exHtml = exHtml.slice(0, sMatching) + newRenderMatching + '\n' + exHtml.slice(eMatching);
fs.writeFileSync(exPath, exHtml, 'utf8');
console.log('✓ Successfully updated public/exercise.html');

// 2. Update public/mock-exam.html
const mockPath = 'public/mock-exam.html';
let mockHtml = fs.readFileSync(mockPath, 'utf8');

const sMockL3 = mockHtml.indexOf('function renderMockLesen3(model){');
const eMockL3 = mockHtml.indexOf('function renderMockHoeren(model){');

if (sMockL3 === -1 || eMockL3 === -1) {
  console.error('Marker for renderMockLesen3 not found!');
  process.exit(1);
}

const newRenderMockLesen3 = `function renderMockLesen3(model){
  window.__mockAnswers = {...itemAnswer(model.exercise.id)};
  const items = model.items || [];
  const heads = getExerciseHeadings(model);
  const usedAnswerIds = new Set(Object.values(window.__mockAnswers).filter(Boolean).map(v => String(v).toUpperCase()));

  const paragraphsListMarkup = items.map((it, idx) => {
    const q = String(it.position_no);
    const selected = String(window.__mockAnswers[q] || '').toUpperCase();

    const options = heads.map((h, i) => {
      const letter = String.fromCharCode(65 + i);
      const ad = parseAdText(h);
      const fullTitle = ad.title ? ad.title : (ad.body ? ad.body.replace(/\\s+/g, ' ').trim() : '');
      const label = fullTitle ? \`Text \${letter}: \${fullTitle}\` : \`Text \${letter}\`;
      const isSelected = selected === letter;
      const isUsed = usedAnswerIds.has(letter) && !isSelected;
      return \`<option value="\${letter}" \${isSelected ? 'selected' : ''} \${isUsed ? 'disabled' : ''}>\${esc(label)}\${isUsed ? ' — ' + text('تم اختياره', 'Bereits ausgewählt') : ''}</option>\`;
    }).join('') + \`<option value="X" \${selected === 'X' ? 'selected' : ''}>\${text('X — لا يوجد عنوان مناسب لهذه الفقرة', 'X — Keine passende Anzeige')}</option>\`;

    return \`
    <article class="mock-item \${selected ? 'answered' : ''}" id="mock-sit-\${q}">
      <div class="paragraph-assignment" style="margin-bottom:14px;">
        <div class="paragraph-assignment-head" style="display:flex;justify-content:space-between;align-items:center;margin-bottom:8px;">
          <span class="assignment-label" style="font-weight:900;color:var(--ink);">\${text('الموقف / الفقرة ' + (idx + 1) + ' — اختر العنوان المناسب:', 'Absatz ' + (idx + 1) + ' — Passende Überschrift / Anzeige:')}</span>
        </div>
        <div class="paragraph-assignment-controls" style="display:flex;align-items:center;gap:10px;">
          <select class="mock-select \${selected ? 'answered' : ''}" data-answer-q="\${esc(q)}" data-mock-ad-select="\${esc(q)}" aria-label="\${esc(it.prompt)}">
            <option value="">— \${text('اختر العنوان المناسب لهذه الفقرة (Text A - L أو X)', 'Passende Überschrift auswählen (Text A - L oder X)')} —</option>
            \${options}
          </select>
          \${selected ? \`<button type="button" class="assignment-selected" data-mock-clear="\${esc(q)}" aria-label="\${text('إلغاء الاختيار','Auswahl löschen')}"><span>\${selected === 'X' ? 'X' : 'Text ' + selected}</span><b>×</b></button>\` : ''}
        </div>
      </div>
      <div class="mock-task-body" style="font-size:15.5px;line-height:1.85;color:var(--ink);">\${escBody(it.prompt)}</div>
    </article>\`;
  }).join('');

  const headingsOverview = \`
    <div class="mock-headings-bank lesen3-headings-overview" style="margin-top:34px;padding:26px;background:var(--white);border:1.5px solid var(--line);border-radius:20px;box-shadow:var(--shadow-sm);">
      <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:16px;flex-wrap:wrap;gap:10px;">
        <div>
          <h3 style="margin:0 0 6px;font-size:18.5px;font-weight:900;display:flex;align-items:center;gap:8px;">
            <span>📰</span>
            <span>\${text('قائمة العناوين والإعلانات المتاحة (12 إعلاناً — Anzeigen A bis L):', 'Verfügbare Anzeigen (Text A bis L):')}</span>
          </h3>
          <small class="muted" style="font-size:13.5px;line-height:1.6;">\${text('اقرأ الفقرات الـ 10 بالأعلى واختر لكل فقرة العنوان المناسب، أو اختر (X) إذا لم يكن لها عنوان مناسب. لا يمكن استخدام العنوان لأكثر من فقرة واحدة.', 'Wählen Sie oben für jeden Absatz die passende Anzeige aus, oder X wenn keine Anzeige passt.')}</small>
        </div>
        <span class="mock-task-count">\${Object.keys(window.__mockAnswers).length} / \${items.length}</span>
      </div>
      <div class="mock-headings-list lesen3-ads-list" style="display:flex;flex-direction:column;gap:16px;">
        \${heads.map((h, i) => {
          const letter = String.fromCharCode(65 + i);
          const ad = parseAdText(h);
          const assignedItem = items.find(it => String(window.__mockAnswers[String(it.position_no)] || '').toUpperCase() === letter);
          const assignedNo = assignedItem ? String(assignedItem.position_no) : '';
          const rawText = (typeof h === 'object') ? [h.title, h.body || h.text || h.content].filter(Boolean).join('\\n\\n') : String(h).trim();
          return \`
          <div class="mock-heading-item \${assignedNo ? 'is-used' : ''}" style="background:var(--bg);border:1.5px solid var(--line);border-radius:14px;padding:18px 20px;display:flex;flex-direction:column;gap:10px;">
            <div style="display:flex;justify-content:space-between;align-items:center;">
              <strong style="font-size:15.5px;font-weight:950;color:#f47b20;display:inline-flex;align-items:center;gap:8px;">
                <span>Text \${letter}</span>
                \${ad.title ? \`<span style="color:var(--ink);font-weight:800;">— \${esc(ad.title)}</span>\` : ''}
              </strong>
              \${assignedNo ? \`<span style="background:#0f172a;color:#fff;font-weight:900;font-size:11.5px;padding:3px 9px;border-radius:6px;">✓ \${text('مخصص للفقرة ' + assignedNo, 'Zugeordnet zu Absatz ' + assignedNo)}</span>\` : ''}
            </div>
            <div class="mock-ad-content" style="font-size:14.5px;line-height:1.75;color:var(--ink);white-space:normal;word-break:break-word;">
              \${escBody(ad.body || (ad.title ? '' : rawText))}
            </div>
          </div>\`;
        }).join('')}
      </div>
    </div>\`;

  return baseShell(\`
    <div class="mock-section-label">
      <span class="tag">Telc \${esc(model.exercise.level||state.session.level)}</span>
      <span class="mock-task-count">\${esc(model.exercise.section)} · \${esc(model.exercise.teil)}</span>
    </div>
    <div class="mock-spb-head" style="margin-top:14px;margin-bottom:16px;">
      <h3><span>📋</span> <span>\${text('الفقرات العشر (المواقف 1 إلى 10):', 'Die 10 Situationen (Absätze 1 bis 10):')}</span></h3>
      <span class="mock-task-count">\${Object.keys(window.__mockAnswers).length} / \${items.length}</span>
    </div>
    <div style="display:flex;flex-direction:column;gap:20px;">
      \${paragraphsListMarkup}
    </div>
    \${headingsOverview}
  \`);
}`;

mockHtml = mockHtml.slice(0, sMockL3) + newRenderMockLesen3 + '\n\n' + mockHtml.slice(eMockL3);

// In mockHtml, ensure bind() supports data-mock-clear and unique constraint
if (!mockHtml.includes('data-mock-clear')) {
  const sBind = mockHtml.indexOf('function bind(){');
  if (sBind !== -1) {
    const bindInject = `
  document.querySelectorAll('[data-mock-clear]').forEach(btn => {
    btn.onclick = (e) => {
      e.stopPropagation();
      const q = String(btn.dataset.mockClear);
      window.__mockAnswers = window.__mockAnswers || {};
      delete window.__mockAnswers[q];
      state.session.answersByExercise[String(currentTask().id)] = {...window.__mockAnswers};
      saveSession();
      render();
    };
  });`;
    mockHtml = mockHtml.slice(0, sBind + 'function bind(){'.length) + bindInject + mockHtml.slice(sBind + 'function bind(){'.length);
  }
}

// In mockHtml bind(), ensure selecting a heading clears it from any other question in Teil 3
const oldHandleAns = "window.__mockAnswers[q] = val || '';";
const newHandleAns = `window.__mockAnswers[q] = val || '';
      const taskObj = currentTask();
      const mObj = state.models[taskObj.id];
      const isL3 = mObj?.exercise?.section === 'Lesen' && mObj?.exercise?.teil === 'Teil 3';
      if (isL3 && val && String(val).toUpperCase() !== 'X') {
        Object.keys(window.__mockAnswers).forEach(k => {
          if (k !== q && String(window.__mockAnswers[k]).toUpperCase() === String(val).toUpperCase()) {
            delete window.__mockAnswers[k];
          }
        });
      }`;

if (mockHtml.includes(oldHandleAns) && !mockHtml.includes('const isL3 =')) {
  mockHtml = mockHtml.replace(oldHandleAns, newHandleAns);
}

fs.writeFileSync(mockPath, mockHtml, 'utf8');
console.log('✓ Successfully updated public/mock-exam.html');

// 3. Update public/assets/app.css
const cssPath = 'public/assets/app.css';
let css = fs.readFileSync(cssPath, 'utf8');

const additionalCss = `
/* ==========================================================================
   UNIVERSAL LIQUID GLASS & UNTRUNCATED TEXT LAYOUT FOR ALL SECTIONS
   ========================================================================== */

/* Liquid Glass Cards across all sections */
.exam-text-card,
.mock-item,
.reading-bank-card,
.long-text,
.spb-questions-container,
.speaking-task-panel,
.writing-block,
.mock-headings-bank,
.matching-headings-bank {
  background: var(--white) !important;
  border: 1.5px solid var(--line) !important;
  border-radius: 20px !important;
  box-shadow: var(--shadow-sm) !important;
  backdrop-filter: blur(16px) !important;
  -webkit-backdrop-filter: blur(16px) !important;
  transition: border-color 0.2s ease, box-shadow 0.2s ease !important;
}

html[data-theme="dark"] .exam-text-card,
html[data-theme="dark"] .mock-item,
html[data-theme="dark"] .reading-bank-card,
html[data-theme="dark"] .long-text,
html[data-theme="dark"] .spb-questions-container,
html[data-theme="dark"] .speaking-task-panel,
html[data-theme="dark"] .writing-block,
html[data-theme="dark"] .mock-headings-bank,
html[data-theme="dark"] .matching-headings-bank {
  background: rgba(30, 41, 59, 0.7) !important;
  border-color: rgba(255, 255, 255, 0.1) !important;
}

/* Zero Text Truncation across all headings, options and bodies */
.mock-select,
.paragraph-assignment select,
.heading-entry,
.exam-text,
.mock-task-body,
.mock-ad-content {
  white-space: normal !important;
  word-break: break-word !important;
  overflow-wrap: break-word !important;
  text-overflow: unset !important;
}

.mock-select option,
.paragraph-assignment select option {
  white-space: normal !important;
  word-break: break-word !important;
  padding: 8px 12px !important;
}

/* Translation placement: ALWAYS directly underneath the text block */
.inline-translation {
  display: none;
  margin-top: 14px !important;
  padding: 14px 18px !important;
  border: 1.5px solid rgba(244, 123, 32, 0.25) !important;
  border-radius: 14px !important;
  background: rgba(244, 123, 32, 0.05) !important;
  backdrop-filter: blur(12px) !important;
  -webkit-backdrop-filter: blur(12px) !important;
  color: var(--ink) !important;
  font-size: 14.5px !important;
  line-height: 1.85 !important;
  direction: rtl !important;
  text-align: right !important;
  font-weight: 550 !important;
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.03) !important;
}

.inline-translation.visible {
  display: block !important;
  animation: fadeInTranslation 0.25s ease-out !important;
}

.inline-translation.loading {
  display: block !important;
  opacity: 0.65 !important;
}

@keyframes fadeInTranslation {
  from { opacity: 0; transform: translateY(-4px); }
  to { opacity: 1; transform: translateY(0); }
}

html[data-theme="dark"] .inline-translation {
  background: rgba(244, 123, 32, 0.08) !important;
  border-color: rgba(244, 123, 32, 0.35) !important;
  color: #f1f5f9 !important;
}

/* Assignment selected button with clear 'x' */
.assignment-selected {
  display: inline-flex !important;
  align-items: center !important;
  gap: 8px !important;
  padding: 6px 14px !important;
  border-radius: 10px !important;
  background: #0f172a !important;
  color: #fff !important;
  font-weight: 850 !important;
  font-size: 13px !important;
  border: none !important;
  cursor: pointer !important;
  transition: transform 0.15s ease, background-color 0.15s ease !important;
}

.assignment-selected:hover {
  background: #1e293b !important;
  transform: scale(1.02) !important;
}

.assignment-selected b {
  font-size: 15px !important;
  opacity: 0.8 !important;
  margin-inline-start: 4px !important;
}

.assignment-selected.model-correct {
  background: #2d9b68 !important;
  color: #fff !important;
}

/* Clean Ad Cards in Headings Bank */
.lesen3-ad-card,
.mock-heading-item {
  transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1) !important;
}

.lesen3-ad-card.is-used,
.mock-heading-item.is-used {
  border-color: rgba(244, 123, 32, 0.4) !important;
  background: rgba(244, 123, 32, 0.03) !important;
}
`;

if (!css.includes('UNIVERSAL LIQUID GLASS & UNTRUNCATED TEXT LAYOUT')) {
  css += '\n' + additionalCss;
  fs.writeFileSync(cssPath, css, 'utf8');
  console.log('✓ Successfully updated public/assets/app.css');
}

console.log('\n=== All Updates Applied Successfully ===');
