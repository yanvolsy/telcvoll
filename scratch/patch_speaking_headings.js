const fs = require('fs');

let html = fs.readFileSync('public/exercise.html', 'utf8');

const s1_search = `   <div class="exercise-heading speaking-heading">
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

const s1_replace = `   <div class="exercise-heading speaking-heading">
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

const s2_search = ` <div class="exercise-heading speaking-heading">
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

const s2_replace = ` <div class="exercise-heading speaking-heading">
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

const crlf = html.includes('\r\n');
let norm = html.replace(/\r\n/g, '\n');

if (norm.includes(s1_search)) {
  norm = norm.replace(s1_search, s1_replace);
  console.log('s1 replaced!');
} else {
  console.log('s1 not found');
}

if (norm.includes(s2_search)) {
  norm = norm.replace(s2_search, s2_replace);
  console.log('s2 replaced!');
} else {
  console.log('s2 not found');
}

if (crlf) norm = norm.replace(/\n/g, '\r\n');
fs.writeFileSync('public/exercise.html', norm, 'utf8');
