const { db } = require('./_lib/db');
const { json } = require('./_lib/auth');
const { requireStudent } = require('./_lib/guard');
const { requireSameOrigin, requestSize } = require('./_lib/request');
const { rateLimit } = require('./_lib/ratelimit');

function cleanJson(text) {
  let s = String(text || '').trim().replace(/^```(?:json)?\s*/i,'').replace(/\s*```$/,'').trim();
  const a=s.indexOf('{'), b=s.lastIndexOf('}');
  if(a>=0 && b>a) s=s.slice(a,b+1);
  try { return JSON.parse(s); }
  catch (e) {
    // Repair the common harmless JSON formatting mistakes produced by chat models.
    const repaired=s
      .replace(/,\s*([}\]])/g,'$1')
      .replace(/}\s*{/g,'},{')
      .replace(/]\s*\[/g,'],[');
    return JSON.parse(repaired);
  }
}
async function extractProviderText(resp) {
  const raw = await resp.text();
  let j = {};
  try { j = JSON.parse(raw); } catch {}
  const text = j?.choices?.[0]?.message?.content
    || j?.choices?.[0]?.text
    || j?.content?.[0]?.text
    || j?.candidates?.[0]?.content?.parts?.map(p => p.text || '').join('')
    || '';
  if (!resp.ok) throw new Error(text || j?.error?.message || `AI provider error (${resp.status})`);
  return text || raw;
}

async function callConfiguredAI(url,key,model,system,prompt) {
  if(!url||!key) throw new Error('Configured AI provider is unavailable.');
  const r=await fetch(url,{method:'POST',headers:{'Content-Type':'application/json',Authorization:`Bearer ${key}`},
    body:JSON.stringify({model,messages:[
      {role:'system',content:system},
      {role:'user',content:prompt}
    ],temperature:0.25})});
  return extractProviderText(r);
}

async function callGemini(key,model,system,prompt) {
  if(!key) throw new Error('GEMINI_API_KEY is not configured');
  const url=`https://generativelanguage.googleapis.com/v1beta/models/${encodeURIComponent(model||'gemini-2.5-flash')}:generateContent?key=${encodeURIComponent(key)}`;
  const r=await fetch(url,{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({
    systemInstruction:{parts:[{text:system}]},
    contents:[{role:'user',parts:[{text:prompt}]}],
    generationConfig:{temperature:0.25,responseMimeType:'application/json'}
  })});
  return extractProviderText(r);
}

async function callGroq(key,model,system,prompt) {
  if(!key) throw new Error('GROQ_API_KEY is not configured');
  const r=await fetch('https://api.groq.com/openai/v1/chat/completions',{method:'POST',headers:{'Content-Type':'application/json',Authorization:`Bearer ${key}`},
    body:JSON.stringify({model:model||'openai/gpt-oss-120b',temperature:0.25,response_format:{type:'json_object'},messages:[
      {role:'system',content:system},
      {role:'user',content:prompt}
    ]})});
  return extractProviderText(r);
}

async function callAI(prompt) {
  const system='You are a realistic TELC German speaking partner and fair examiner. Always follow the requested JSON output exactly.';
  const configuredUrl=process.env.AI_API_URL;
  const configuredKey=process.env.AI_API_KEY;
  const geminiKey=process.env.GEMINI_API_KEY;
  const groqKey=process.env.GROQ_API_KEY;
  let firstError='';

  if(configuredUrl&&configuredKey){
    try{return await callConfiguredAI(configuredUrl,configuredKey,process.env.AI_MODEL,system,prompt)}
    catch(e){firstError=e.message||String(e)}
  }
  if(geminiKey){
    try{return await callGemini(geminiKey,process.env.GEMINI_SPEAKING_MODEL||process.env.GEMINI_CHAT_MODEL||process.env.GEMINI_WRITING_MODEL||'gemini-2.5-flash',system,prompt)}
    catch(e){firstError=firstError?`${firstError} | ${e.message||e}`:(e.message||String(e))}
  }
  if(groqKey){
    try{return await callGroq(groqKey,process.env.GROQ_SPEAKING_MODEL||process.env.GROQ_CHAT_MODEL||process.env.GROQ_WRITING_MODEL||'openai/gpt-oss-120b',system,prompt)}
    catch(e){firstError=firstError?`${firstError} | ${e.message||e}`:(e.message||String(e))}
  }
  throw new Error(firstError || 'AI provider is not configured. Set AI_API_URL + AI_API_KEY, GEMINI_API_KEY, or GROQ_API_KEY in Netlify environment variables.');
}
exports.handler=async(event)=>{
  if(event.httpMethod!=='POST') return json(405,{error:'Method not allowed.'});
  const student=await requireStudent(event);
  if(!student) return json(401,{error:'unauthenticated'});
  if(!student.ai_enabled) return json(403,{error:'AI is not included in your plan.'});
  const allowed=await rateLimit('ai_speaking_session',30,3600,String(student.student_id));
  if(!allowed) return json(429,{error:'You have reached the AI usage limit for this hour.'});
  let b={}; try{b=JSON.parse(event.body||'{}')}catch{}
  const id=parseInt(b.id||'0',10), mode=String(b.mode||'turn');
  if(!id) return json(400,{error:'Missing exercise id.'});
  const ex=(await db().query("SELECT id,title,body,level,section,teil FROM exercises WHERE id=$1 AND status='published' AND deleted_at IS NULL",[id])).rows[0];
  if(!ex || String(ex.section)!=='Sprechen') return json(404,{error:'Sprechen exercise not found.'});
  const transcript=String(b.transcript||'').slice(0,12000);
  const history=Array.isArray(b.history)?b.history.slice(-12):[];
  const requestedTeil=String(b.teil||'').trim();
  if(mode==='resolve' && requestedTeil){
    const q=await db().query("SELECT id,title,body,level,section,teil FROM exercises WHERE status='published' AND deleted_at IS NULL AND section='Sprechen' AND level=$1 AND lower(trim(title))=lower(trim($2)) AND lower(replace(trim(teil),' ',''))=lower(replace(trim($3),' ','')) ORDER BY id LIMIT 1",
      [ex.level||'B2',ex.title||'',requestedTeil]);
    if(q.rows[0]) return json(200,{exercise:q.rows[0]});
    return json(404,{error:'Für dieses Thema wurde kein passender '+requestedTeil+' gefunden.'});
  }
  const currentTeil = (requestedTeil || ex.teil || 'Teil 1').trim();
  const context=`LEVEL: ${ex.level||'B2'}\nTEIL: ${currentTeil}\nTHEMA: ${ex.title||''}\nTASK:\n${ex.body||''}`;
  let prompt;
  if(mode==='opening'){
    if(currentTeil.includes('1')){
      prompt=`You are the exam Partner in a TELC B2 Sprechen Teil 1 (Präsentation) training exercise. Speak ONLY German. The examiner Jerry has just instructed the candidate to hold their presentation on '${ex.title}'.
Greet the candidate cordially as their partner. Tell them you look forward to their presentation, invite them to begin when ready, and say you will listen attentively. Keep it to 1-2 friendly sentences. Do NOT ask follow-up questions yet. Do NOT use Arabic.
${context}
Return ONLY JSON: {"reply":""}`;
    } else if(currentTeil.includes('3')){
      prompt=`You are the exam Partner in a TELC B2 Sprechen Teil 3 (Gemeinsam etwas planen) training exercise. Speak ONLY German. The examiner Jerry has just instructed the candidates to plan '${ex.title}' together.
Greet the candidate warmly, express enthusiasm about organizing this project/event together, and propose the very first concrete step or ask how to begin (e.g. suggesting when/where to hold it or which planning point to tackle first). Keep it natural, proactive, and collaborative (2 sentences). Do NOT use Arabic.
${context}
Return ONLY JSON: {"reply":""}`;
    } else {
      prompt=`You are the Partner in a TELC B2 Sprechen Teil 2 (Diskussion) training exercise. Speak ONLY German. The examiner Jerry has just instructed the candidates to discuss the topic. Your job is to start the partner side naturally: briefly summarize the core INHALT of the supplied topic in 1-2 sentences, then ask the student to summarize the Inhalt in their own words. Do not give Meinung 1 or Meinung 2 yet. Do not use Arabic. Do not invent information outside the supplied topic.
${context}
Return ONLY JSON: {"reply":""}`;
    }
  } else if(mode==='model'){
    prompt=`Create a high-quality TELC B2 Sprechen training model based ONLY on the supplied topic, task and Teil. The supplied topic is the source of truth. Do not invent a different topic and do not claim this is an official telc answer.
${context}

RULES FOR TEIL 1 (Präsentation):
- Build a model presentation by the student (greeting, topic introduction, structure, personal experience/examples, pros/cons or recommendations, conclusion).
- Followed by the partner's positive reaction and 2 realistic follow-up questions, with concise, proficient answers by the student.
- Structure fields: inhalt (presentation points), erfahrung1 (personal examples), meinung1 (conclusions/recommendations).

RULES FOR TEIL 2 (Diskussion) — FOLLOW THIS ROLE DISTRIBUTION EXACTLY:
- Meinung 1 is the STUDENT'S opinion with reasons.
- Meinung 2 is the PARTNER'S opinion with independent reasoning.
- Erfahrung 1 is the STUDENT'S personal experience/example.
- Erfahrung 2 is the PARTNER'S personal perspective/example.
- Vorteile und Nachteile are discussed alternately by BOTH speakers.
- Dialogue progression: Partner introduces INHALT -> Student summarizes INHALT -> Student MEINUNG 1 -> Partner MEINUNG 2 -> Student ERFAHRUNG 1 -> Partner ERFAHRUNG 2 -> Both discuss VORTEILE & NACHTEILE -> Shared ABSCHLUSS.
- Structure fields: inhalt, meinung1, meinung2, erfahrung1, erfahrung2, vorteile, nachteile.

RULES FOR TEIL 3 (Gemeinsam etwas planen):
- Model a realistic, highly collaborative JOINT PLANNING dialogue between student and partner (10-14 turns).
- Cover the required points step-by-step: Termin und Ort, Aufgabenverteilung, Budget & Kosten, Verpflegung, Einladungen, Ablauf/Programm.
- Both participants actively make concrete suggestions, react, propose alternatives, and negotiate agreements.
- Conclude with a clear shared agreement summarizing who does what.
- Structure fields: planung (list of concrete agreed decisions).

Generate 5-7 independent practice questions, QUESTIONS ONLY: no answers, no hints, no explanations. Generate 5-8 useful Redemittel suitable for the actual topic and Teil.

Return ONLY JSON in this exact shape:
{"title":"","note":"","dialogue":[{"speaker":"student|partner","phase":"","text":""}],"structure":{"inhalt":[],"meinung1":[],"meinung2":[],"erfahrung1":[],"erfahrung2":[],"vorteile":[],"nachteile":[],"planung":[]},"questions":[""],"redemittel":[""]}
Use empty arrays for structure fields that do not fit the Teil. Keep dialogue in German.`;
  } else if(mode==='evaluate'){
    prompt=`Evaluate a TELC speaking practice session for training only. Do not claim an official telc score.
${context}
TRANSCRIPT:
${transcript}
Return ONLY JSON:
{"criteria":[{"key":"ausdruck","label":"Ausdrucksfähigkeit","score":0,"max":5,"comment":""},{"key":"aufgabe","label":"Aufgabenbewältigung","score":0,"max":5,"comment":""},{"key":"richtigkeit","label":"Formale Richtigkeit","score":0,"max":5,"comment":""},{"key":"aussprache","label":"Aussprache und Intonation","score":0,"max":5,"comment":"Aus dem Transkript nicht zuverlässig beurteilbar."},{"key":"interaktion","label":"Interaktion","score":0,"max":5,"comment":""}],"total":0,"strengths":[],"priorities":[],"summary_de":"","summary_ar":""}
Score 0-5 for each. For pronunciation explicitly say it cannot reliably be assessed from text transcript and do not pretend to hear audio. Keep feedback specific to this topic and Teil.`;
  } else {
    prompt=`Act as the exam PARTNER (not Jerry the examiner) for a realistic TELC German speaking simulation. Stay in German. Be natural, concise, and interactive. The student is the candidate and you are the independent conversation partner. Never become the examiner and never write the student's answer for them.
${context}
Student transcript:
${transcript}
Conversation history:
${JSON.stringify(history)}

SPECIFIC RULES BY TEIL:

FOR TEIL 1 (Präsentation):
- Turn 1 (after student delivers presentation): React positively to what they said, mention one interesting detail, and ask ONE thoughtful follow-up question (Prüfungsfrage) about their presentation (e.g., personal motivation, challenges, or recommendations).
- Turn 2 (after student answers your first question): Acknowledge their response, and ask a second interesting follow-up question.
- Turn 3+ (after student answers): Thank them warmly, say that all your questions are answered, and wrap up nicely ("Vielen Dank für deine Antworten, das war sehr aufschlussreich!"). Set "continue": false.

FOR TEIL 2 (Diskussion):
- If history is empty, begin with the INHALT stage: briefly state the topic and ask the student to summarize the core message in their own words.
- Then proceed naturally: Meinung 1 (student) -> Meinung 2 (partner) -> Erfahrung 1 (student) -> Erfahrung 2 (partner) -> Vorteile & Nachteile (discuss together, using B2 connectors like einerseits/andererseits, allerdings) -> Abschluss.
- Ask only ONE main question or make ONE point at a time. Keep it engaging.

FOR TEIL 3 (Gemeinsam etwas planen):
- Actively plan and negotiate the task together point-by-point (Termin, Ort, Aufgaben, Budget, Essen/Getränke, Einladungen, Programm).
- Do not just agree passively. Propose concrete ideas ("Ich könnte mich um ... kümmern", "Was hältst du von Samstag 14 Uhr?").
- React constructively to the student's suggestions, agreeing or suggesting improvements.
- Once all main tasks are planned, summarize what was agreed upon and finish positively. Set "continue": false.

GENERAL RULES:
- Reply ONLY in German. Never use Arabic in the conversation itself.
- Keep replies concise (2-4 sentences max per turn).
Return ONLY JSON: {"reply":"","short_note":"","continue":true}`;
  }
  try{
    let raw=await callAI(prompt);
    let out;
    try { out=cleanJson(raw); }
    catch(parseError) {
      const repairPrompt=`Return ONLY valid JSON. Repair the following AI output without changing its meaning. Do not add commentary. OUTPUT:\n${String(raw).slice(0,30000)}`;
      raw=await callAI(repairPrompt);
      out=cleanJson(raw);
    }
    await db().query('INSERT INTO ai_logs(student_id,kind,input_text,output_text) VALUES($1,$2,$3,$4)',
      [student.student_id,'speaking',JSON.stringify({exercise_id:id,mode,transcript}),JSON.stringify(out)]);
    return json(200,out);
  }catch(e){ return json(502,{error:e.message}); }
};
