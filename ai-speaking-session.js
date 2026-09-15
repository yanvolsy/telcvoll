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
async function callAI(prompt) {
  const url=process.env.AI_API_URL, key=process.env.AI_API_KEY;
  if(!url||!key) throw new Error('AI provider is not configured.');
  const r=await fetch(url,{method:'POST',headers:{'Content-Type':'application/json',Authorization:`Bearer ${key}`},
    body:JSON.stringify({model:process.env.AI_MODEL,messages:[
      {role:'system',content:'You are a realistic TELC German speaking partner and fair examiner.'},
      {role:'user',content:prompt}
    ]})});
  const raw=await r.text(); let j={}; try{j=JSON.parse(raw)}catch{}
  const t=j?.choices?.[0]?.message?.content || j?.content?.[0]?.text || '';
  if(!r.ok) throw new Error(t || `AI provider error (${r.status})`);
  return t;
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
  if(mode==='evaluate'){
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
