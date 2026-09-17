const { db } = require('./_lib/db');
const { json } = require('./_lib/auth');
const { requireStudent } = require('./_lib/guard');
const { rateLimit } = require('./_lib/ratelimit');

function cleanJson(text) {
  let s = String(text || '').trim().replace(/^```(?:json)?\s*/i,'').replace(/\s*```$/,'').trim();
  const a=s.indexOf('{'), b=s.lastIndexOf('}');
  if(a>=0 && b>a) s=s.slice(a,b+1);
  return JSON.parse(s);
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
    generationConfig:{temperature:0.25}
  })});
  return extractProviderText(r);
}

async function callGroq(key,model,system,prompt) {
  if(!key) throw new Error('GROQ_API_KEY is not configured');
  const r=await fetch('https://api.groq.com/openai/v1/chat/completions',{method:'POST',headers:{'Content-Type':'application/json',Authorization:`Bearer ${key}`},
    body:JSON.stringify({model:model||'openai/gpt-oss-120b',temperature:0.25,messages:[
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
  const context=`LEVEL: ${ex.level||''}\nTEIL: ${ex.teil||''}\nTHEMA: ${ex.title||''}\nTASK:\n${ex.body||''}`;
  let prompt;
  if(mode==='model'){
    prompt=`Create a high-quality TELC German speaking training model based ONLY on the supplied topic, task and Teil. Follow the structure and level of detail typical of the provided TELC-style examples. Do not invent a different topic and do not claim this is an official telc answer.
${context}
The output must be useful as a model for a learner, not just a generic conversation.
For Teil 2, organize the model around the topic points in a natural order. When the topic supports it, cover: Inhalt, Meinung, Erfahrung, Vorteile and Nachteile. Turn these points into a realistic dialogue between a strong student and Partner/Jerry, with natural partner reactions and follow-up questions. The student turns should demonstrate what a good B2 candidate could say.
For Teil 3, model a realistic joint planning conversation. Cover the concrete planning points contained in the supplied task (for example time, place, participants, cost, tasks, priorities, materials, alternatives). The partner should react, make counter-suggestions, ask questions, negotiate, and the dialogue should finish with a clear common agreement. Do not force points that are not relevant to the supplied task.
For Teil 1, model a short structured presentation/opinion with a natural partner reaction and one or two follow-up questions.
Generate 5-7 dialogue turns, including at least two strong student turns and realistic Partner/Jerry reactions. Generate 4-6 independent practice questions, QUESTIONS ONLY: no answers, no hints, no explanations, no answer keys. Generate 5-8 useful Redemittel.
Return ONLY JSON in this exact shape:
{"title":"","note":"","dialogue":[{"speaker":"jerry|partner|student","text":""}],"structure":{"inhalt":[],"meinung":[],"erfahrung":[],"vorteile":[],"nachteile":[],"planung":[]},"questions":[""],"redemittel":[""]}
Use empty arrays for structure fields that do not fit the Teil. The questions array must contain questions only. Keep the dialogue in German. Keep the note short. Make the dialogue and structure consistent with each other.`;
  } else if(mode==='evaluate'){
    prompt=`Evaluate a TELC speaking practice session for training only. Do not claim an official telc score.
${context}
TRANSCRIPT:
${transcript}
Return ONLY JSON:
{"criteria":[{"key":"ausdruck","label":"Ausdrucksfähigkeit","score":0,"max":5,"comment":""},{"key":"aufgabe","label":"Aufgabenbewältigung","score":0,"max":5,"comment":""},{"key":"richtigkeit","label":"Formale Richtigkeit","score":0,"max":5,"comment":""},{"key":"aussprache","label":"Aussprache und Intonation","score":0,"max":5,"comment":"Aus dem Transkript nicht zuverlässig beurteilbar."},{"key":"interaktion","label":"Interaktion","score":0,"max":5,"comment":""}],"total":0,"strengths":[],"priorities":[],"summary_de":"","summary_ar":""}
Score 0-5 for each. For pronunciation explicitly say it cannot reliably be assessed from text transcript and do not pretend to hear audio. Keep feedback specific to this topic and Teil.`;
  } else {
    prompt=`Act as the exam PARTNER for a TELC German speaking simulation. Stay in German. Be natural, concise, and interactive. Never become the examiner.
${context}
Student transcript:
${transcript}
Conversation history:
${JSON.stringify(history)}
Rules by Teil:
- Teil 1: react to the presentation/experience and ask one relevant follow-up question.
- Teil 2: state a clear position, react to the student's argument, and ask a useful counter-question.
- Teil 3: actively plan/negotiate; introduce or react to concrete points such as time, place, cost, tasks, priorities.
Do not invent a different topic. Ask only one main question/request at a time.
Return ONLY JSON: {"reply":"","short_note":"","continue":true}`;
  }
  try{
    const raw=await callAI(prompt); const out=cleanJson(raw);
    await db().query('INSERT INTO ai_logs(student_id,kind,input_text,output_text) VALUES($1,$2,$3,$4)',
      [student.student_id,'speaking',JSON.stringify({exercise_id:id,mode,transcript}),JSON.stringify(out)]);
    return json(200,out);
  }catch(e){ return json(502,{error:e.message}); }
};
