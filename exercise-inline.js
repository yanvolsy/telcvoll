


const id=qs('id'); const duration=Number(qs('duration')||0); const sessionId=qs('session'); const mockMode=qs('mock')==='1' && !!sessionId; let model=null; let answers={}; let activeItem=null; let submitted=false; let resultData=null;
let matchingOrder=null; let headingOrder=null; let optionOrders={}; let showModelAnswers=false; let titleRevealed=false; const translationCache=new Map();
const text=(ar,de)=>getLang()==='ar'?ar:de;
function saveExerciseReturn(){try{sessionStorage.setItem('telc_exercise_return',JSON.stringify({url:location.href,scrollY:window.scrollY}));}catch{}}
document.getElementById('exerciseBack')?.addEventListener('click',e=>{e.preventDefault();saveExerciseReturn();location.href='/dashboard.html';});
function escBody(v){return esc(v).replace(/\n/g,'<br>');}
function parseSettings(x){return x?.settings_json && typeof x.settings_json==='object'?x.settings_json:{};}
function answerValue(n){return answers[String(n)]||'';}
function labelFor(n,val){const it=model.items.find(x=>String(x.position_no)===String(n));const o=(it?.options||[]).find(x=>x.option_key===val);return o?o.option_text:val;}
function shuffle(arr){const a=[...arr];for(let i=a.length-1;i>0;i--){const j=Math.floor(Math.random()*(i+1));[a[i],a[j]]=[a[j],a[i]];}return a;}
let activeSpeakButton=null;
function stopSpeaking(){window.speechSynthesis.cancel();if(activeSpeakButton){activeSpeakButton.classList.remove('speaking-active');activeSpeakButton.setAttribute('aria-pressed','false');activeSpeakButton=null;}}
function speakGerman(raw,btn=null){const source=String(raw||'').trim();if(!source)return;if(btn&&activeSpeakButton===btn&&window.speechSynthesis.speaking){stopSpeaking();return;}stopSpeaking();const u=new SpeechSynthesisUtterance(source);u.lang='de-DE';u.rate=.9;if(btn){activeSpeakButton=btn;btn.classList.add('speaking-active');btn.setAttribute('aria-pressed','true');u.onend=()=>{if(activeSpeakButton===btn){btn.classList.remove('speaking-active');btn.setAttribute('aria-pressed','false');activeSpeakButton=null;}};u.onerror=u.onend;}window.speechSynthesis.speak(u);}
async function translateText(raw,target=getLang()==='ar'?'ar':'de'){
  const source=String(raw||'').trim(); if(!source)return '';
  const key=target+'|'+source; if(translationCache.has(key))return translationCache.get(key);
  try{
    const url='https://translate.googleapis.com/translate_a/single?client=gtx&sl=de&tl='+encodeURIComponent(target)+'&dt=t&q='+encodeURIComponent(source);
    const r=await fetch(url); if(!r.ok)throw new Error('translation failed'); const d=await r.json();
    const out=(d?.[0]||[]).map(x=>x?.[0]||'').join('').trim(); if(!out)throw new Error('translation empty');
    translationCache.set(key,out); return out;
  }catch(e){return ''}
}
function translationBox(idKey){return `<div class="inline-translation" id="${idKey}"></div>`;}
function textTools(raw,targetId){return `<div class="text-tools"><button type="button" class="mini-tool" data-translate="${targetId}-translation" data-source-id="${targetId}" aria-label="${text('ترجمة','Übersetzen')}" aria-pressed="false">文</button><button type="button" class="mini-tool" data-speak="${targetId}" aria-label="${text('نطق بالألمانية','Deutsch vorlesen')}" aria-pressed="false">◉</button></div>`;}
function toolRegistry(){const map=new Map(); document.querySelectorAll('[data-content-id]').forEach(el=>map.set(el.dataset.contentId,el.dataset.source||''));return map;}
function bindTextTools(){const registry=toolRegistry();document.querySelectorAll('[data-translate]').forEach(btn=>btn.onclick=async()=>{const target=document.getElementById(btn.dataset.translate);if(!target)return;if(target.classList.contains('visible')){target.classList.remove('visible');target.textContent='';btn.setAttribute('aria-pressed','false');return;}const source=registry.get(btn.dataset.sourceId)||'';target.classList.add('loading');const out=await translateText(source,'ar');target.classList.remove('loading');target.textContent=out||text('تعذرت الترجمة.','Übersetzung nicht verfügbar.');target.classList.add('visible');btn.setAttribute('aria-pressed','true');});document.querySelectorAll('[data-speak]').forEach(btn=>btn.onclick=()=>{const source=registry.get(btn.dataset.speak)||'';speakGerman(source,btn);});}
function renderAudio(){return model.exercise.audio_url?`<div class="audio-box"><audio controls preload="metadata" src="${esc(model.exercise.audio_url)}"></audio><span>${text('الملف الصوتي','Audiodatei')}</span></div>`:'';}
function matchingMeta(){return model.exercise.section==='Lesen'&&model.exercise.teil==='Teil 1'?{title:'ÜBERSCHRIFTEN',sub:'FÜR TEXT',ar:'العناوين'}:model.exercise.section==='Lesen'&&model.exercise.teil==='Teil 3'?{title:'SITUATIONEN',sub:'ZUORDNUNG',ar:'المواقف'}:model.exercise.section==='Hören'&&model.exercise.teil==='Teil 3'?{title:'AUSSAGEN',sub:'ZUORDNUNG',ar:'العبارات'}:{title:'AUSWAHL',sub:'ZUORDNUNG',ar:'الاختيارات'};}
function captureExerciseScroll(){
 const anchor=document.querySelector('.exam-main .active-item, .exam-main .exam-text-card, .exam-main .tf-row, .exam-side .side-question');
 return {main:document.querySelector('.exam-main')?.scrollTop||0,side:document.querySelector('.exam-side')?.scrollTop||0,workspace:document.querySelector('.exam-workspace')?.scrollTop||0,x:window.scrollX||0,y:window.scrollY||0,anchorTop:anchor?.getBoundingClientRect().top??null};
}
function restoreExerciseScroll(state){if(!state)return;const restore=()=>{const m=document.querySelector('.exam-main'),sd=document.querySelector('.exam-side'),ws=document.querySelector('.exam-workspace');if(m)m.scrollTop=state.main;if(sd)sd.scrollTop=state.side;if(ws)ws.scrollTop=state.workspace;window.scrollTo(state.x,state.y);if(state.anchorTop!==null){const anchor=document.querySelector('.exam-main .active-item, .exam-main .exam-text-card, .exam-main .tf-row, .exam-side .side-question');if(anchor){const delta=anchor.getBoundingClientRect().top-state.anchorTop;if(Math.abs(delta)>1)window.scrollTo(state.x,window.scrollY+delta);}}};restore();requestAnimationFrame(restore);requestAnimationFrame(()=>requestAnimationFrame(restore));setTimeout(restore,40);}
function rerenderExerciseStable(state){renderWorkspace(false);bindActions();restoreExerciseScroll(state);}

function renderMatching(){
 const heads=(parseSettings(model.exercise).headings||[]).filter(Boolean);
 const items=model.items||[];
 if(!matchingOrder)matchingOrder=items.map(it=>String(it.position_no));
 if(!headingOrder)headingOrder=heads.map((_,i)=>i);
 const usedKeys=new Set(Object.values(answers).filter(Boolean).map(String));
 const main=matchingOrder.map(n=>items.find(it=>String(it.position_no)===n)).filter(Boolean).map(it=>{
   const selected=answerValue(it.position_no);
   const cid='para-'+it.position_no;
   const detail=resultData?(resultData.details||[]).find(d=>String(d.prompt)===String(it.prompt)):null;
   const correctVal=detail?.correct_answer||'';
   const shownAnswer=showModelAnswers&&correctVal?correctVal:selected;
   const shownLabel=shownAnswer?labelFor(it.position_no,shownAnswer):'';
   const resultClass=detail?(detail.ok?'answer-correct':'answer-wrong'):'';
   const options=heads.map((h,i)=>({key:String.fromCharCode(65+i),text:h}));
   const selectOptions=options.map(o=>{
     const used=usedKeys.has(o.key)&&selected!==o.key;
     return `<option value="${esc(o.key)}" ${selected===o.key?'selected':''} ${used?'disabled':''}>${esc(o.text)}${used?' — '+text('تم اختياره','Bereits ausgewählt'):''}</option>`;
   }).join('');
   return `<article class="exam-text-card ${selected?'answered':''} ${resultClass} ${String(activeItem)===String(it.position_no)?'active-item':''}" data-item="${it.position_no}">
     <div class="paragraph-assignment"><div class="assignment-label">${text('العنوان المناسب','Passende Überschrift')}</div><select data-paragraph-select="${it.position_no}" aria-label="${text('اختيار العنوان','Überschrift auswählen')}"><option value="">${text('— اختر العنوان —','— Überschrift auswählen —')}</option>${selectOptions}</select>${shownLabel?`<button type="button" class="assignment-selected" data-clear="${it.position_no}" aria-label="${text('إلغاء الاختيار','Auswahl löschen')}"><span>${esc(shownLabel)}</span><b>×</b></button>`:`<span class="assignment-empty">${text('لم يتم الاختيار','Noch nicht ausgewählt')}</span>`}</div>
     <div class="exam-card-top">${textTools(it.prompt,cid)}</div>
     <div class="exam-text" id="${cid}" data-content-id="${cid}" data-source="${esc(it.prompt)}">${escBody(it.prompt)}</div>
     <div class="inline-translation" id="${cid}-translation"></div>
   </article>`;
 }).join('');
 const side=headingOrder.map(i=>({h:heads[i],i})).map(({h,i})=>{
   const key=String.fromCharCode(65+i);
   const owner=items.find(it=>String(answerValue(it.position_no))===key);
   const ownerDetail=owner&&resultData?(resultData.details||[]).find(d=>String(d.prompt)===String(owner.prompt)):null;
   const modelDetail=(resultData?.details||[]).find(d=>String(d.correct_answer)===key);
   const modelOwner=modelDetail?items.find(it=>String(it.prompt)===String(modelDetail.prompt)):null;
   const selectedForActive=activeItem&&answerValue(activeItem)===key;
   const isUsed=!!owner;
   const resultClass=ownerDetail?(ownerDetail.ok?'result-correct':'result-wrong'):'';
   const modelClass=showModelAnswers&&modelOwner?'model-correct':'';
   const cid='head-'+key;
   return `<div class="heading-option-wrap ${selectedForActive?'is-active-match':''} ${isUsed?'heading-used':''} ${selectedForActive?'heading-current':''}">
      <button type="button" class="choice-card ${selectedForActive?'selected':''} ${resultClass} ${modelClass}" data-choice="${key}" ${isUsed&&!selectedForActive?'disabled':''}><b id="${cid}" data-content-id="${cid}" data-source="${esc(h)}">${esc(h)}</b>${isUsed?`<small class="heading-used-badge">✓ ${text('تم اختياره','Ausgewählt')}</small>`:''}</button>
      ${textTools(h,cid)}
      <div class="inline-translation" id="${cid}-translation"></div>
   </div>`;
 }).join('');
 const answeredCount=Object.keys(answers).filter(k=>answers[k]).length;
 const resultHtml='';
 document.getElementById('content').innerHTML=layout(main,`<div class="side-title side-title-large"><div><b>ÜBERSCHRIFTEN</b><small>FÜR TEXT</small></div><span>${answeredCount}/${items.length}</span></div><div class="matching-controls"><button type="button" class="side-icon shuffle-all" aria-label="${text('خلط العناوين والفقرات','Überschriften und Texte mischen')}" title="${text('خلط العناوين والفقرات','Überschriften und Texte mischen')}">⤨</button></div><div class="heading-list">${side}</div>`);
 document.querySelectorAll('[data-item]').forEach(c=>{
   c.onmousedown=e=>{if(e.target.closest('select,.text-tools,.mini-tool,.clear-selection'))return;e.preventDefault();};
   c.onclick=e=>{if(e.target.closest('select,.text-tools,.mini-tool,.clear-selection'))return;activeItem=String(c.dataset.item);document.querySelectorAll('[data-item]').forEach(x=>x.classList.toggle('active-item',String(x.dataset.item)===activeItem));};
 });
 document.querySelectorAll('[data-paragraph-select]').forEach(sel=>sel.onchange=e=>{
   e.stopPropagation(); const st=captureExerciseScroll();
   const n=String(sel.dataset.paragraphSelect), chosen=String(sel.value||'');
   activeItem=n;
   if(!chosen){delete answers[n];}else{Object.keys(answers).forEach(k=>{if(k!==n&&answers[k]===chosen)delete answers[k];});answers[n]=chosen;}
   renderMatching();restoreExerciseScroll(st);bindActions();
 });
 document.querySelectorAll('[data-clear]').forEach(b=>b.onclick=e=>{e.stopPropagation();const st=captureExerciseScroll();delete answers[String(b.dataset.clear)];activeItem=String(b.dataset.clear);renderMatching();restoreExerciseScroll(st);bindActions();});
 document.querySelectorAll('[data-choice]').forEach(b=>{b.onmousedown=e=>e.preventDefault();b.onclick=e=>{e.preventDefault();if(b.disabled||!activeItem)return;const st=captureExerciseScroll();const chosen=b.dataset.choice;Object.keys(answers).forEach(k=>{if(k!==String(activeItem)&&answers[k]===chosen)delete answers[k];});answers[String(activeItem)]=chosen;renderMatching();restoreExerciseScroll(st);bindActions();};});
 const sh=document.querySelector('.shuffle-all');
 if(sh)sh.onclick=e=>{e.stopPropagation();const st=captureExerciseScroll();matchingOrder=shuffle(matchingOrder);headingOrder=shuffle(headingOrder);activeItem=null;renderMatching();restoreExerciseScroll(st);bindActions();};
 bindTextTools();
}
function renderSprachbausteine1(){
 const items=(model.items||[]); const longTextId='spb1-text';
 const main=`<div class="long-text"><div class="long-text-tools">${textTools(model.exercise.body||'',longTextId)}</div><div id="${longTextId}" data-content-id="${longTextId}" data-source="${esc(model.exercise.body||'')}">${renderBody(model.exercise.body)}</div>${translationBox(longTextId+'-translation')}</div>`;
 let side=`<div class="side-title side-title-large"><div><b>AUFGABEN</b><small>SPRACHBAUSTEINE TEIL 1</small></div><div class="matching-controls"><button type="button" class="side-icon shuffle-spb1" aria-label="${text('خلط الاختيارات','Antworten mischen')}" title="${text('خلط الاختيارات','Antworten mischen')}">⤨</button></div><span>${Object.keys(answers).length}/${items.length}</span></div>`;
 side+=items.map(it=>{
   const n=String(it.position_no), examNo=Number(n)+20, chosen=answerValue(n);
   const detail=resultData?.details?.find(d=>String(d.prompt)===String(it.prompt));
   const correct=detail?.correct_answer||''; const showCorrect=showModelAnswers&&correct;
   const base=(it.options||[]).slice(0,3);
   if(!optionOrders[n]) optionOrders[n]=base.map(o=>o.option_key);
   const byKey=new Map(base.map(o=>[String(o.option_key),o]));
   const ordered=optionOrders[n].map(k=>byKey.get(String(k))).filter(Boolean);
   return `<div class="side-question spb1-question ${detail?(detail.ok?'result-correct':'result-wrong'):''}">
      <div class="question-prompt question-text-tools"><strong>${examNo}</strong><span>${text('الفراغ','Lücke')} ${examNo}</span></div>
      <div class="side-options">${ordered.map((o,oi)=>{const ocid=`spb1-o-${n}-${oi}`;return `<div class="spb1-option-wrap"><button type="button" class="side-option ${chosen===o.option_key?'selected':''} ${detail&&chosen===o.option_key?(detail.ok?'result-correct':'result-wrong'):''} ${showCorrect&&correct===o.option_key?'model-correct':''}" data-q="${esc(n)}" data-o="${esc(o.option_key)}"><span class="option-text" id="${ocid}" data-content-id="${ocid}" data-source="${esc(o.option_text||'')}">${esc(o.option_text||'')}</span></button>${textTools(o.option_text||'',ocid)}${translationBox(ocid+'-translation')}</div>`;}).join('')}</div>
   </div>`;
 }).join('');
 document.getElementById('content').innerHTML=layout(main,side,'spb1');
 document.querySelectorAll('[data-q]').forEach(b=>b.onclick=()=>selectAnswer(b.dataset.q,b.dataset.o));
 const sh=document.querySelector('.shuffle-spb1'); if(sh)sh.onclick=e=>{e.preventDefault();e.stopPropagation();const st=captureExerciseScroll();items.forEach(it=>{const n=String(it.position_no);optionOrders[n]=shuffle((it.options||[]).slice(0,3).map(o=>o.option_key));});rerenderExerciseStable(st);};
 bindTextTools();
}

function renderChoiceQuestions(){
 const isLesen2=model.exercise.section==='Lesen'&&model.exercise.teil==='Teil 2';
 const gap2=model.exercise.section==='Sprachbausteine'&&model.exercise.teil==='Teil 2';
 const items=isLesen2?(model.items||[]).slice(0,5):(model.items||[]);
 const longTextId='lesen2-text';
 const main=isLesen2?`<div class="long-text lesen2-long-text"><div class="long-text-tools">${textTools(model.exercise.body||'',longTextId)}</div><div class="long-text-content" id="${longTextId}" data-content-id="${longTextId}" data-source="${esc(model.exercise.body||'')}">${escBody(model.exercise.body||'')}</div>${translationBox(longTextId+'-translation')}</div>`:gap2?`<div class="long-text"><div class="long-text-tools">${textTools(model.exercise.body||'','gap2-text')}</div><div id="gap2-text" data-content-id="gap2-text" data-source="${esc(model.exercise.body||'')}">${renderBody(model.exercise.body)}</div>${translationBox('gap2-text-translation')}</div>`:`<div class="long-text"><div class="long-text-tools">${textTools(model.exercise.body||'','choice-long-text')}</div><div id="choice-long-text" data-content-id="choice-long-text" data-source="${esc(model.exercise.body||'')}">${escBody(model.exercise.body||'')}</div>${translationBox('choice-long-text-translation')}</div>`;
 let side='';
 if(gap2){
   const opts=sharedOptions();
   side=`<div class="side-title"><b>WÖRTER</b><span>${Object.keys(answers).length}/${items.length}</span></div><div class="word-bank">${opts.map(([k,v],oi)=>{const wid='wordbank-'+oi;const isCorrect=(resultData?.details||[]).some(d=>String(d.correct_answer)===String(k));return `<div class="word-card-wrap"><button class="word-card ${Object.values(answers).includes(k)?'used':''} ${showModelAnswers&&isCorrect?'model-correct':''}" data-word="${esc(k)}"><small>${String.fromCharCode(65+oi)}</small><b>${esc(v)}</b></button>${textTools(v,wid)}${translationBox(wid+'-translation')}</div>`;}).join('')}</div>`;
 } else if(isLesen2){
   side=`<div class="side-title side-title-large"><div><b>LESEN TEIL 2</b></div><div class="matching-controls"><button type="button" class="side-icon shuffle-options" aria-label="${text('خلط الاختيارات','Antworten mischen')}" title="${text('خلط الاختيارات','Antworten mischen')}">⤨</button></div><span>${Object.keys(answers).length}/${items.length}</span></div>`+
     items.map((it,i)=>{
       const n=String(it.position_no);
       const chosen=answerValue(n);
       const detail=resultData?.details?.find(d=>String(d.prompt)===String(it.prompt));
       const correct=detail?.correct_answer||'';
       const showCorrect=showModelAnswers&&correct;
       const baseOptions=(it.options||[]).slice(0,3);
       if(!optionOrders[n]) optionOrders[n]=baseOptions.map(o=>o.option_key);
       const byKey=new Map(baseOptions.map(o=>[String(o.option_key),o]));
       const ordered=optionOrders[n].map(k=>byKey.get(String(k))).filter(Boolean);
       return `<div class="side-question lesen2-question ${detail?(detail.ok?'result-correct':'result-wrong'):''}">
         <div class="question-prompt question-text-tools">${textTools(it.prompt||'',`lesen2-q-${n}`)}<div class="question-prompt-text" id="lesen2-q-${n}" data-content-id="lesen2-q-${n}" data-source="${esc(it.prompt||'')}">${esc(it.prompt||'')}</div>${translationBox(`lesen2-q-${n}-translation`)}</div>
         <div class="side-options">${ordered.map((o,oi)=>{const ocid=`lesen2-o-${n}-${oi}`;return `<div class="lesen2-option-wrap">
           <div class="lesen2-option-row"><button type="button" class="side-option ${chosen===o.option_key?'selected':''} ${detail&&chosen===o.option_key?(detail.ok?'result-correct':'result-wrong'):''} ${showCorrect&&correct===o.option_key?'model-correct':''}" data-q="${esc(n)}" data-o="${esc(o.option_key)}"><span class="option-text" id="${ocid}" data-content-id="${ocid}" data-source="${esc(o.option_text||'')}">${esc(o.option_text||'')}</span></button>${textTools(o.option_text||'',ocid)}</div>${translationBox(`${ocid}-translation`)}</div>`;}).join('')}</div>
       </div>`;
     }).join('');
 } else {
   side=`<div class="side-title"><b>${model.exercise.task_type==='MCQ'?'AUFGABEN':'LÜCKEN'}</b><span>${Object.keys(answers).length}/${items.length}</span></div>`+items.map((it,i)=>{const qid='generic-q-'+it.position_no;return `<div class="side-question ${(()=>{const d=resultData?.details?.find(x=>String(x.prompt)===String(it.prompt));return d?(d.ok?'result-correct':'result-wrong'):''})()}"><div class="question-prompt question-text-tools">${textTools(it.prompt||'',qid)}<div id="${qid}" data-content-id="${qid}" data-source="${esc(it.prompt||'')}">${esc(it.prompt||'')}</div>${translationBox(qid+'-translation')}</div><div class="side-options">${(it.options||[]).map((o,oi)=>{const oid=`generic-o-${it.position_no}-${oi}`;const d=resultData?.details?.find(x=>String(x.prompt)===String(it.prompt));const isChosen=answerValue(it.position_no)===o.option_key;const isCorrect=showModelAnswers&&String(d?.correct_answer||'')===String(o.option_key);const resultClass=d&&isChosen?(d.ok?'result-correct':'result-wrong'):'';return `<div class="option-tool-wrap"><button class="side-option ${isChosen?'selected':''} ${resultClass} ${isCorrect?'model-correct':''}" data-q="${it.position_no}" data-o="${esc(o.option_key)}">${esc(o.option_text)}</button>${textTools(o.option_text||'',oid)}${translationBox(oid+'-translation')}</div>`;}).join('')}</div></div>`;}).join('');
 }
 document.getElementById('content').innerHTML=layout(main,side,isLesen2?'lesen2':'');
 if(gap2)document.querySelectorAll('[data-word]').forEach(b=>b.onclick=()=>{const first=items.find(it=>!answerValue(it.position_no));if(first)selectAnswer(first.position_no,b.dataset.word);});
 document.querySelectorAll('[data-q]').forEach(b=>b.onclick=()=>selectAnswer(b.dataset.q,b.dataset.o));
 if(isLesen2){
   const sh=document.querySelector('.shuffle-options');
   if(sh)sh.onclick=e=>{
     e.preventDefault(); e.stopPropagation();
     items.forEach(it=>{const n=String(it.position_no); optionOrders[n]=shuffle((it.options||[]).slice(0,3).map(o=>o.option_key));});
     const st=captureExerciseScroll();
     rerenderExerciseStable(st);
   };
 }
 bindTextTools();
}

function renderBody(body){
 let html=escBody(body||'');
 (model.items||[]).forEach(i=>{
   const n=String(i.position_no);
   const val=answerValue(n);
   const detail=resultData?.details?.find(d=>String(d.prompt)===String(i.prompt));
   const correct=String(detail?.correct_answer||'');
   const displayVal=showModelAnswers&&correct?correct:val;
   const resultClass=detail&&val?(detail.ok?'result-correct':'result-wrong'):'';
   const modelClass=showModelAnswers&&correct?'model-correct':'';
   const isSpb1=model.exercise.section==='Sprachbausteine'&&model.exercise.teil==='Teil 1';
   const isSpb2=model.exercise.section==='Sprachbausteine'&&model.exercise.teil==='Teil 2';
   const examNo=isSpb1?Number(n)+20:isSpb2?Number(n)+30:Number(n);
   let re;
   if(isSpb1){
     const correctText=String(i.correctText||i.prompt||'').trim();
     re=correctText
       ?new RegExp('\\('+examNo+'\\)|\\['+examNo+'\\]|\\{'+examNo+'\\}|\\['+escapeRegExp(correctText)+'\\]','g')
       :new RegExp('\\('+examNo+'\\)|\\['+examNo+'\\]|\\{'+examNo+'\\}','g');
   }else{
     re=new RegExp('\\('+n+'\\)|\\['+n+'\\]|\\{'+n+'\\}','g');
   }
   const shown=displayVal?esc(labelFor(n,displayVal)):'('+examNo+')';
   html=html.replace(re,'<span class="inline-answer '+(displayVal?'filled ':'')+resultClass+' '+modelClass+'">'+shown+'</span>');
 });
 return html;
}
function escapeRegExp(s){return s.replace(/[.*+?^${}()|[\]\\]/g,'\\$&');}function selectAnswer(n,val){
 const scrollState=captureExerciseScroll();
 activeItem=String(n);answers[String(n)]=val;
 submitted=false; resultData=null; showModelAnswers=false;
 rerenderExerciseStable(scrollState);
}
function sharedOptions(){const map=new Map();(model.items||[]).forEach(it=>(it.options||[]).forEach(o=>{if(o.option_text&&!map.has(o.option_key))map.set(o.option_key,o.option_text);}));return [...map.entries()];}
function renderTF(){const main=`${renderAudio()}<div class="tf-list">${model.items.map(it=>{const qid='tf-main-'+it.position_no;return `<article class="tf-row"><div class="item-number">${it.position_no}</div><div class="tf-text"><div class="question-text-tools">${textTools(it.prompt||'',qid)}<div id="${qid}" data-content-id="${qid}" data-source="${esc(it.prompt||'')}">${escBody(it.prompt)}</div>${translationBox(qid+'-translation')}</div></div><div class="tf-actions"><button class="side-option ${answerValue(it.position_no)==='Richtig'?'selected':''} ${(()=>{const d=resultData?.details?.find(x=>String(x.prompt)===String(it.prompt));return d&&answerValue(it.position_no)==='Richtig'?(d.ok?'result-correct':'result-wrong'):''})()} ${(()=>{const d=resultData?.details?.find(x=>String(x.prompt)===String(it.prompt));return showModelAnswers&&String(d?.correct_answer||'')==='Richtig'?'model-correct':''})()}" data-q="${it.position_no}" data-o="Richtig">Richtig</button><button class="side-option ${answerValue(it.position_no)==='Falsch'?'selected':''} ${(()=>{const d=resultData?.details?.find(x=>String(x.prompt)===String(it.prompt));return d&&answerValue(it.position_no)==='Falsch'?(d.ok?'result-correct':'result-wrong'):''})()} ${(()=>{const d=resultData?.details?.find(x=>String(x.prompt)===String(it.prompt));return showModelAnswers&&String(d?.correct_answer||'')==='Falsch'?'model-correct':''})()}" data-q="${it.position_no}" data-o="Falsch">Falsch</button></div></article>`;}).join('')}</div>`;const side=`<div class="side-title"><b>RICHTIG / FALSCH</b><span>${Object.keys(answers).length}/${model.items.length}</span></div>${model.items.map(it=>{const qid='tf-side-'+it.position_no;return `<div class="side-question compact"><div class="question-text-tools">${textTools(it.prompt||'',qid)}<div id="${qid}" data-content-id="${qid}" data-source="${esc(it.prompt||'')}">${esc(it.prompt||'')}</div>${translationBox(qid+'-translation')}</div><div class="side-options"><button class="side-option ${answerValue(it.position_no)==='Richtig'?'selected':''} ${(()=>{const d=resultData?.details?.find(x=>String(x.prompt)===String(it.prompt));return d&&answerValue(it.position_no)==='Richtig'?(d.ok?'result-correct':'result-wrong'):''})()} ${(()=>{const d=resultData?.details?.find(x=>String(x.prompt)===String(it.prompt));return showModelAnswers&&String(d?.correct_answer||'')==='Richtig'?'model-correct':''})()}" data-q="${it.position_no}" data-o="Richtig">Richtig</button><button class="side-option ${answerValue(it.position_no)==='Falsch'?'selected':''} ${(()=>{const d=resultData?.details?.find(x=>String(x.prompt)===String(it.prompt));return d&&answerValue(it.position_no)==='Falsch'?(d.ok?'result-correct':'result-wrong'):''})()} ${(()=>{const d=resultData?.details?.find(x=>String(x.prompt)===String(it.prompt));return showModelAnswers&&String(d?.correct_answer||'')==='Falsch'?'model-correct':''})()}" data-q="${it.position_no}" data-o="Falsch">Falsch</button></div></div>`;}).join('')}`;document.getElementById('content').innerHTML=layout(main,side);document.querySelectorAll('[data-q]').forEach(b=>b.onclick=()=>selectAnswer(b.dataset.q,b.dataset.o));bindTextTools();}
function renderWriting(){
 const settings=parseSettings(model.exercise);
 const situationRaw=settings.situation_text||model.exercise.body||'';
 const taskRaw=settings.task_text||'';
 const sid='writing-situation'; const tid='writing-task';
 document.getElementById('content').innerHTML=`<div class="writing-page-shell">
   <div class="writing-workspace">
    <section class="writing-left">
      <div class="writing-title"><span>${esc(model.exercise.level||'B2')} · ${esc(model.exercise.teil)}</span><h1>${esc(model.exercise.title)}</h1></div>
      <div class="writing-time-rule">Zeit: 30 Minuten | Mindestens 150 Wörter</div>
      <div class="writing-exam-note">Vergessen Sie nicht: Absender, Anschrift, Datum, Betreffzeile, Anrede und Schlussformel. Schreiben Sie mindestens 150 Wörter.</div>
      <div class="writing-block"><h2>${text('الوضعية','Situation')}</h2><div class="question-text-tools">${textTools(situationRaw,sid)}<div id="${sid}" class="writing-german-content" data-content-id="${sid}" data-source="${esc(situationRaw)}">${escBody(situationRaw)}</div>${translationBox(sid+'-translation')}</div></div>
      ${taskRaw?`<div class="writing-block"><h2>${text('المطلوب','Aufgabe')}</h2><div class="writing-task question-text-tools">${textTools(taskRaw,tid)}<div id="${tid}" class="writing-german-content" data-content-id="${tid}" data-source="${esc(taskRaw)}">${escBody(taskRaw)}</div>${translationBox(tid+'-translation')}</div></div>`:''}
    </section>
    <section class="writing-editor">
      <div class="editor-tools"><div class="editor-chars">${['ä','ö','ü','ß','Ä','Ö','Ü'].map(c=>`<button type="button" data-char="${c}">${c}</button>`).join('')}</div><span id="wordCount">0 Wörter</span></div>
      <textarea id="writingAnswer" placeholder="${text('ابدأ في كتابة إجابتك هنا…','Beginne hier mit deiner Antwort…')}"></textarea>
      <div class="editor-bottom"><button class="btn ai-check-btn" id="aiWritingCheck">✦ ${text('تصحيح بالذكاء الاصطناعي','Mit KI korrigieren')}</button></div>
    </section>
   </div>
   <div id="writingAiResult" class="writing-ai-result" hidden></div>
 </div>`;
 const ta=document.getElementById('writingAnswer');
 ta.value=localStorage.getItem('writing_'+id)||'';
 const update=()=>{document.getElementById('wordCount').textContent=(ta.value.trim()?ta.value.trim().split(/\s+/).length:0)+' '+text('كلمة','Wörter');localStorage.setItem('writing_'+id,ta.value);};
 ta.oninput=update; update();
 document.querySelectorAll('[data-char]').forEach(b=>b.onclick=()=>{const a=ta.selectionStart,c=ta.selectionEnd;ta.setRangeText(b.dataset.char,a,c,'end');ta.focus();update();});
 document.getElementById('aiWritingCheck').onclick=()=>runWritingAI(ta.value);
 bindTextTools();
}

function renderWritingAIResult(r){
 const box=document.getElementById('writingAiResult'); if(!box)return;
 const criteria=(r.criteria||[]).map(c=>{const pct=c.max?Math.round(c.score/c.max*100):0;return `<div class="ai-criterion"><div class="ai-criterion-head"><strong>${esc(c.label)}</strong><span>${c.score}/${c.max}</span></div><div class="ai-bar"><i style="width:${pct}%"></i></div><p>${esc(c.comment||'')}</p></div>`;}).join('');
 const corrections=(r.corrections||[]).map(c=>`<div class="ai-correction"><div><del>${esc(c.original)}</del><span>→</span><strong>${esc(c.corrected)}</strong></div><small>${esc(c.category)} — ${esc(c.explanation)}</small></div>`).join('');
 const strengths=(r.strengths||[]).map(x=>`<li>${esc(x)}</li>`).join('');
 const priorities=(r.priorities||[]).map(x=>`<li>${esc(x)}</li>`).join('');
 const missing=(r.task_completion?.missing_points||[]).map(x=>`<li>${esc(x)}</li>`).join('');
 box.hidden=false;
 box.innerHTML=`<div class="ai-result-head">
   <div><span class="ai-label">${text('التقييم والتحليل','Bewertung & Analyse')}</span><div class="ai-score-line"><strong>${Math.round(r.overall_score||0)}</strong><span>/ 45</span></div><small class="ai-score-note">${text('نقاط تدريبية وفق معايير Schreiben في TELC B2','Trainingspunkte nach den Schreibkriterien von telc B2')}</small></div>
   
 </div>
 <div class="ai-summary"><strong>${text('التحليل العام','Gesamtanalyse')}</strong><p>${esc(getLang()==='de'?(r.summary_de||''):(r.summary_ar||''))}</p></div>
 <div class="ai-criteria">${criteria}</div>
 <div class="ai-two-col"><div><h3>${text('نقاط القوة','Stärken')}</h3><ul>${strengths||`<li>${text('لا توجد بيانات إضافية.','Keine zusätzlichen Angaben.')}</li>`}</ul></div><div><h3>${text('الأولوية للتحسين','Prioritäten')}</h3><ul>${priorities||'<li>—</li>'}</ul></div></div>
 ${missing?`<div class="ai-task-warning"><h3>${text('نقاط لم تتم الإجابة عنها','Nicht erfüllte Aufgabenpunkte')}</h3><ul>${missing}</ul></div>`:''}
 ${corrections?`<div class="ai-section"><h3>${text('الأخطاء والتصحيح','Fehler & Korrekturen')}</h3><div class="ai-corrections">${corrections}</div></div>`:''}
  <div class="ai-disclaimer">${text('هذا تقييم تدريبي بالذكاء الاصطناعي وليس نتيجة رسمية من TELC.','Dies ist eine KI-Trainingsbewertung und keine offizielle telc-Prüfungsnote.')}</div>`;
 box.scrollIntoView({behavior:'smooth',block:'start'});
}
async function runWritingAI(answer){
 const btn=document.getElementById('aiWritingCheck'); const box=document.getElementById('writingAiResult');
 if(!answer.trim()){box.hidden=false;box.innerHTML=`<div class="ai-error">${text('اكتب إجابتك أولاً ثم اطلب التصحيح.','Schreibe zuerst deine Antwort und starte dann die Korrektur.')}</div>`;return;}
 btn.disabled=true; const old=btn.textContent; btn.textContent=text('جاري تحليل الإجابة…','Antwort wird analysiert…');
 try{const r=await api('ai-writing-correct',{method:'POST',body:{exercise_id:id,answer}});markExerciseCompleted(id);localStorage.setItem('writing_ai_result_'+id,JSON.stringify(r));renderWritingAIResult(r);}
 catch(e){box.hidden=false;box.innerHTML=`<div class="ai-error">${esc(e.message)}</div>`;}
 finally{btn.disabled=false;btn.textContent=old;}
}
function getMockSession(){try{const s=JSON.parse(localStorage.getItem('telc_self_test')||'null');return s&&s.id===sessionId&&s.mock?s:null;}catch{return null;}}
function mockRemaining(){const s=getMockSession();return s?Math.max(0,Math.ceil((Number(s.endAt)-Date.now())/1000)):0;}
function goNextMock(){const session=getMockSession();if(!session)return false;session.index=(session.ids||[]).findIndex(x=>String(x)===String(id));localStorage.setItem('telc_self_test',JSON.stringify(session));const nextId=session.ids[session.index+1];if(nextId){location.href='/exercise.html?id='+encodeURIComponent(nextId)+'&session='+encodeURIComponent(sessionId)+'&mock=1';return true;}location.href='/self-test-result.html';return true;}
async function advanceSession(){if(mockMode)return goNextMock();return false;}
async function finishMockSession(){const session=getMockSession();if(!session)return; if(!submitted){try{const r=await api('exercise-submit',{method:'POST',body:{exercise_id:id,answers}});session.results=session.results||[];session.results.push({id,title:model.exercise.title,section:model.exercise.section,teil:model.exercise.teil,score:r.score,max:r.max,percent:r.percent,result:r.result});localStorage.setItem('telc_self_test',JSON.stringify(session));}catch(e){}} location.href='/self-test-result.html?expired=1';}
function startMockTimer(){const el=document.getElementById('timerEl');if(!mockMode||!el||el.dataset.started)return;el.dataset.started='1';const tick=()=>{const n=mockRemaining();el.textContent=String(Math.floor(n/60)).padStart(2,'0')+':'+String(n%60).padStart(2,'0');el.classList.toggle('timer-danger',n<=60);if(n>0)window.setTimeout(tick,250);else finishMockSession();};tick();}
function renderSpeaking(){
 const qid='speaking-question', body=model.exercise.body||'', teil=String(model.exercise.teil||'Teil 1');
 const hint=teil==='Teil 1'?text('قدّم موضوعك بالألمانية، ثم تفاعل مع الشريك.','Präsentiere dein Thema auf Deutsch und tausche dich danach mit deinem Partner aus.'):
 teil==='Teil 2'?text('ناقش الموضوع مع الشريك: عبّر عن رأيك، ناقش الحجج وردّ على الأسئلة.','Diskutiere das Thema mit deinem Partner: Begründe deine Meinung, diskutiere Argumente und reagiere auf Fragen.'):
 text('خططا للمهمة معًا وتوصلا إلى اتفاق.','Plant die Aufgabe gemeinsam und findet eine konkrete Einigung.');
 document.getElementById('content').innerHTML=`<div class="speaking-exercise-shell">
 <div class="thema-title-row speaking-title-row"><h1 id="thema-title" data-content-id="thema-title" data-source="${esc(model.exercise.title)}" class="${titleRevealed?'':'thema-title-hidden'}">${esc(model.exercise.title)}</h1><div class="thema-tools">${textTools(model.exercise.title,'thema-title')}<div class="inline-translation" id="thema-title-translation"></div><button type="button" class="mini-tool title-reveal" id="titleReveal" aria-label="${text('إظهار العنوان','Titel anzeigen')}"><span class="eye-icon eye-off"></span></button></div></div>
 <div class="speaking-layout"><section class="speaking-task-panel"><div class="speaking-task-head"><span class="tag">${esc(model.exercise.level||'B2')} · ${esc(teil)}</span><strong>${text('الموضوع','Thema')}</strong></div><div class="speaking-task-text question-text-tools">${textTools(body,qid)}<div id="${qid}" data-content-id="${qid}" data-source="${esc(body)}">${escBody(body)}</div>${translationBox(qid+'-translation')}</div><div class="speaking-hint">${esc(hint)}</div></section>
 <section class="speaking-simulator"><div class="speaking-sim-head"><div><span class="tag">${esc(teil)}</span><h2>${text('محاكاة التحدث','Sprechsimulation')}</h2></div><span class="speaking-live-dot">●</span></div><div class="speaking-chat" id="speakingChat"></div>
 <div class="speaking-record"><div class="speaking-wave"><i></i><i></i><i></i><i></i><i></i><i></i><i></i><i></i></div><button type="button" class="speaking-mic" id="speakingMic">🎙</button><div class="speaking-time" id="speakingTime">00:00</div><small>${text('اضغط على الميكروفون وابدأ التحدث بالألمانية','Mikrofon drücken und auf Deutsch sprechen')}</small></div>
 <div class="speaking-input-row"><textarea id="speakingInput" placeholder="${text('يمكنك الكتابة هنا إذا لم يعمل الميكروفون…','Falls das Mikrofon nicht funktioniert, kannst du hier schreiben…')}"></textarea><button type="button" class="btn dark" id="speakingSend">${text('إرسال','Senden')}</button></div>
 <div class="speaking-controls"><button type="button" class="btn" id="speakingStop" disabled>${text('إيقاف','Stopp')}</button><button type="button" class="btn dark" id="speakingFinish">${text('إنهاء وتقييم','Beenden & bewerten')}</button></div><div id="speakingEval" class="speaking-eval" hidden></div></section></div></div>`;
 initInlineSpeaking(teil);bindTextTools();
}
function initInlineSpeaking(currentTeil){
 const chat=document.getElementById('speakingChat'),input=document.getElementById('speakingInput'),send=document.getElementById('speakingSend'),mic=document.getElementById('speakingMic'),stop=document.getElementById('speakingStop'),finish=document.getElementById('speakingFinish'),timeEl=document.getElementById('speakingTime'),evalBox=document.getElementById('speakingEval');
 let history=[],transcript=[],recognition=null,busy=false,startAt=null,timer=null;
 const add=(who,msg)=>{const d=document.createElement('div');d.className='speaking-bubble '+who;d.innerHTML=`<b>${who==='jerry'?'Jerry':who==='partner'?text('الشريك','Partner'):text('أنت','Du')}</b><span>${esc(msg)}</span>`;chat.appendChild(d);chat.scrollTop=chat.scrollHeight};
 const clock=()=>{if(timer)return;startAt=Date.now();timer=setInterval(()=>{const n=Math.floor((Date.now()-startAt)/1000);timeEl.textContent=String(Math.floor(n/60)).padStart(2,'0')+':'+String(n%60).padStart(2,'0')},500)};
 const sendText=async val=>{val=String(val||'').trim();if(!val||busy)return;busy=true;send.disabled=true;add('me',val);transcript.push('Schüler: '+val);history.push({role:'student',content:val});input.value='';clock();try{const r=await api('ai-speaking-session',{method:'POST',body:{id,mode:'turn',transcript:transcript.join('\n'),history,teil:currentTeil}});if(r.reply){add('partner',r.reply);speakGerman(r.reply);history.push({role:'partner',content:r.reply})}}catch(e){add('jerry',e?.message||'AI-Fehler')}finally{busy=false;send.disabled=false}};
 add('jerry',currentTeil==='Teil 1'?text('مرحبًا، أنا Jerry. ابدأ بعرض الموضوع، وبعدها سأتفاعل معك كشريك.','Hallo, ich bin Jerry. Beginne mit deiner Präsentation; danach reagiere ich als dein Prüfungspartner.') : currentTeil==='Teil 2'?text('مرحبًا، أنا Jerry. ابدأ برأيك حول الموضوع، وسنناقش الحجج معًا.','Hallo, ich bin Jerry. Beginne mit deiner Meinung zum Thema; wir diskutieren die Argumente gemeinsam.') : text('مرحبًا، أنا Jerry. لنخطط للمهمة معًا ونصل إلى اتفاق.','Hallo, ich bin Jerry. Lass uns die Aufgabe gemeinsam planen und eine Einigung finden.'));
 send.onclick=()=>sendText(input.value);input.addEventListener('keydown',e=>{if(e.key==='Enter'&&e.ctrlKey)sendText(input.value)});
 mic.onclick=()=>{const SR=window.SpeechRecognition||window.webkitSpeechRecognition;if(!SR){input.focus();return}recognition=new SR();recognition.lang='de-DE';recognition.interimResults=false;recognition.continuous=false;recognition.onresult=e=>sendText(e.results[0]?.[0]?.transcript||'');recognition.onend=()=>{mic.disabled=false;stop.disabled=true};recognition.onerror=()=>{mic.disabled=false;stop.disabled=true};recognition.start();mic.disabled=true;stop.disabled=false;clock()};stop.onclick=()=>recognition?.stop();
 finish.onclick=async()=>{if(busy||!transcript.length)return;busy=true;finish.disabled=true;try{const r=await api('ai-speaking-session',{method:'POST',body:{id,mode:'evaluate',transcript:transcript.join('\n'),teil:currentTeil}});evalBox.hidden=false;evalBox.innerHTML=`<div class="speaking-eval-head"><strong>${text('تقييم Jerry','Jerry · Bewertung')}</strong><b>${esc(r.total??0)} / 25</b></div><div class="speaking-eval-grid">${(r.criteria||[]).map(c=>`<article><b>${esc(c.label)}</b><strong>${esc(c.score)} / ${esc(c.max||5)}</strong><p>${esc(c.comment)}</p></article>`).join('')}</div><div class="speaking-feedback"><h3>${text('نقاط القوة','Stärken')}</h3><ul>${(r.strengths||[]).map(x=>`<li>${esc(x)}</li>`).join('')}</ul><h3>${text('أولوية التحسين','Prioritäten')}</h3><ul>${(r.priorities||[]).map(x=>`<li>${esc(x)}</li>`).join('')}</ul><p>${esc(getLang()==='ar'?(r.summary_ar||''):(r.summary_de||''))}</p></div>`;evalBox.scrollIntoView({behavior:'smooth',block:'nearest'})}catch(e){add('jerry',e?.message||'AI-Fehler')}finally{busy=false;finish.disabled=false}};
}
function layout(main,side,workspaceClass=''){
 const mockTitle=mockMode?'':`<div class="thema-title-row"><h1 id="thema-title" data-content-id="thema-title" data-source="${esc(model.exercise.title||'')}" class="${titleRevealed?'':'thema-title-hidden'}">${esc(model.exercise.title)}</h1><div class="thema-tools">${textTools(model.exercise.title,'thema-title')}<div class="inline-translation" id="thema-title-translation"></div><button type="button" class="mini-tool title-reveal" id="titleReveal" aria-label="${text('إظهار العنوان','Titel anzeigen')}" title="${text('إظهار العنوان','Titel anzeigen')}"><span class="eye-icon eye-off" aria-hidden="true"></span></button></div></div>`;
 const headingTools=mockMode?'':mockTitle;
 const timer=(mockMode||duration)?`<div class="progress-pill ${mockMode?'mock-global-timer':''}" id="timerEl">00:00</div>`:'';
 const resultPanel=resultData?`<div class="inline-result-panel ${resultData.percent>=60?'pass':'fail'}"><div class="result-panel-main"><span class="result-panel-label">${text('النتيجة','Ergebnis')}</span><strong>${resultData.score} / ${resultData.max}</strong></div><div class="result-panel-meta"><span>${resultData.percent}%</span><b>${esc(resultData.result||'')}</b></div></div>`:''; return `<div class="exercise-heading"><div class="exercise-heading-title"><span class="tag">Telc ${esc(model.exercise.level||'B2')} · ${esc(model.exercise.section)}</span>${headingTools}<small>${esc(model.exercise.teil)}</small></div>${renderAudio()}${timer}</div>${resultPanel}<div class="exam-workspace ${workspaceClass}"><section class="exam-main">${main}</section><aside class="exam-side">${side}</aside></div><div class="exercise-actions">${mockMode?'':`<a class="btn dark topics-back" href="/dashboard.html">${text('العودة إلى المواضيع','Zurück zu den Themen')}</a>`}<div class="exercise-nav"><button class="btn" id="checkBtn">${text(mockMode?'إنهاء الجزء':'تحقق من الإجابات',mockMode?'Teil beenden':'Antworten prüfen')}</button>${mockMode?'':`<button class="btn model-btn" id="modelBtn">${text('الإجابة النموذجية','Musterlösung')}</button>`}</div></div>`;
}

function bindActions(){
 const b=document.getElementById('checkBtn');
 if(b)b.onclick=submit;
 const mb=document.getElementById('modelBtn');
 if(mb)mb.onclick=async()=>{
   const st=captureExerciseScroll();
   try{
     if(!submitted)await submit();
     if(!resultData)return;
     showModelAnswers=true;
     rerenderExerciseStable(st);
   }catch(e){document.getElementById('content').insertAdjacentHTML('beforeend',`<div class="alert bad">${esc(e.message)}</div>`);restoreExerciseScroll(st);}
 };
 const tr=document.getElementById('titleReveal');
 if(tr)tr.onclick=()=>{titleRevealed=!titleRevealed;const h=document.getElementById('thema-title');if(h)h.classList.toggle('thema-title-hidden',!titleRevealed);tr.setAttribute('aria-label',text(titleRevealed?'إخفاء العنوان':'إظهار العنوان',titleRevealed?'Titel ausblenden':'Titel anzeigen'));};
 if(mockMode){startMockTimer();}else if(duration&&document.getElementById('timerEl')&&!document.getElementById('timerEl').dataset.started){document.getElementById('timerEl').dataset.started='1';startTimer(document.getElementById('timerEl'),duration,submit);}
}

function renderWorkspace(){stopSpeaking();const t=model.exercise.task_type;const isSpb1=model.exercise.section==='Sprachbausteine'&&model.exercise.teil==='Teil 1';const isMatching=(t==='MATCHING')||(model.exercise.section==='Lesen'&&['Teil 1','Teil 3'].includes(model.exercise.teil))||(model.exercise.section==='Hören'&&model.exercise.teil==='Teil 3');if(t==='WRITING')return renderWriting();if(t==='SPEAKING')return renderSpeaking();if(t==='AUDIO_TF')return renderTF();if(isSpb1)return renderSprachbausteine1();if(isMatching)return renderMatching();return renderChoiceQuestions();}
function renderResult(r){const st=captureExerciseScroll();submitted=true;resultData=r;rerenderExerciseStable(st);}
async function submit(){if(submitted)return;if(!model.items.length){if(mockMode){goNextMock();}return;}try{const r=await api('exercise-submit',{method:'POST',body:{exercise_id:id,answers}});localStorage.setItem('last_exercise_result_'+id,JSON.stringify(r));markExerciseCompleted(id);if(mockMode){const s=getMockSession();if(s){s.results=s.results||[];s.results.push({id,title:model.exercise.title,section:model.exercise.section,teil:model.exercise.teil,score:r.score,max:r.max,percent:r.percent,result:r.result});s.index=(s.ids||[]).findIndex(x=>String(x)===String(id));localStorage.setItem('telc_self_test',JSON.stringify(s));}goNextMock();return;}renderResult(r);}catch(e){document.getElementById('content').insertAdjacentHTML('beforeend',`<div class="alert bad">${esc(e.message)}</div>`);}}
(async()=>{try{const d=await api('exercise-get?id='+encodeURIComponent(id));model=d;document.body.classList.toggle('mock-mode',mockMode);renderWorkspace();bindActions();if(mockMode)startMockTimer();}catch(e){document.getElementById('content').innerHTML=`<div class="alert bad">${esc(e.message)}</div>`;}})();

