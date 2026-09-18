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
  const context=`LEVEL: ${ex.level||''}\nTEIL: ${ex.teil||''}\nTHEMA: ${ex.title||''}\nTASK:\n${ex.body||''}`;
  let prompt;
  if(mode==='opening'){
    prompt=`You are the Partner in a TELC B2 Sprechen Teil 2 training exercise. Speak ONLY German. The examiner Jerry has just instructed the candidates to discuss the topic. Your job is to start the partner side naturally: briefly summarize the core INHALT of the supplied topic in 1-2 sentences, then ask the student to summarize the Inhalt in their own words. Do not give Meinung 1 or Meinung 2 yet. Do not use Arabic. Do not invent information outside the supplied topic.
${context}
Return ONLY JSON: {"reply":""}`;
  } else if(mode==='model'){
    prompt=`Create a high-quality TELC B2 Sprechen training model based ONLY on the supplied topic, task and Teil. The supplied topic is the source of truth. Do not invent a different topic and do not claim this is an official telc answer.
${context}

IMPORTANT FOR TEIL 2 — FOLLOW THIS ROLE DISTRIBUTION EXACTLY:
- Meinung 1 is the STUDENT'S opinion. The student gives their own clear position and a reason.
- Meinung 2 is the PARTNER'S opinion. The partner gives an independent opinion, which may agree, disagree, or add a different perspective. It is NOT another opinion that the student must memorize.
- Erfahrung 1 is the STUDENT'S personal experience/example.
- Erfahrung 2 is the PARTNER'S personal experience/example.
- Vorteile und Nachteile are discussed by BOTH speakers. They should exchange arguments, react to each other, ask follow-up questions, and possibly agree/disagree.
- The dialogue must feel like a real two-person B2 discussion, not a monologue and not a list of prepared answers.
- Use the actual points contained in the supplied topic. Do not force sections that are absent from the topic.

For Teil 2, build the model dialogue in this exact progression whenever the source contains these elements:
1) Jerry (examiner) is NOT part of the candidate/partner dialogue. The model dialogue itself contains only student and partner.
2) The PARTNER first gives a short model for INHALT and then asks the STUDENT to give/summarize the Inhalt.
3) The STUDENT gives MEINUNG 1 (their own opinion + reason).
4) The PARTNER gives MEINUNG 2 (the partner's own independent opinion + reason).
5) The STUDENT gives ERFAHRUNG 1.
6) The PARTNER gives ERFAHRUNG 2 as a plausible partner example/perspective, without pretending it is a real personal memory.
7) Both discuss the concrete Vorteile und Nachteile from the source, alternating turns, reacting to each other, asking short follow-up questions, agreeing/disagreeing and giving reasons.
8) Finish naturally with a short conclusion.
Do NOT label Meinung 2 as another student answer. It belongs to the partner. Do NOT make the student say Erfahrung 2.

For TEIL 3, model the exact style of the supplied TELC Voll training examples: this is a JOINT PLANNING dialogue between two candidates. Use ONLY the concrete planning points that appear in the supplied task. The dialogue must start naturally (for example a short greeting), then move point-by-point through the actual Aufgaben. For each point, one partner proposes something concrete, the other reacts, agrees/disagrees or offers an alternative, and they briefly negotiate before moving to the next point. Include realistic questions such as 'Was denkst du?', 'Was brauchen wir?', 'Wann treffen wir uns?' only when they fit the current task. Do not invent new planning categories that are absent from the source. End with a concrete shared decision/agreement and, if appropriate, a short arrangement for the next meeting. Use 10-16 dialogue turns for Teil 3. Every dialogue line must use speaker 'student' or 'partner' and phase 'planung' except the final line, which may use 'abschluss'. Make the student and partner both active: neither speaker should dominate, and do not write the student's entire side as a monologue. The model dialogue is a training example, not an official telc answer.
For Teil 1, model a short structured presentation followed by a natural partner reaction and follow-up questions.

Generate 8-12 dialogue turns for Teil 2 so that all required roles are clearly demonstrated. Use only speaker values student and partner for Teil 2. Add a phase to every dialogue line using one of: inhalt, meinung1, meinung2, erfahrung1, erfahrung2, vorteile, nachteile, abschluss. For Teil 3 use planung and for Teil 1 use inhalt/meinung/abschluss as appropriate.
Generate 5-7 independent practice questions, QUESTIONS ONLY: no answers, no hints, no explanations, no answer keys. Generate 5-8 useful Redemittel suitable for the actual topic and Teil.

Return ONLY JSON in this exact shape:
{"title":"","note":"","dialogue":[{"speaker":"student|partner","phase":"","text":""}],"structure":{"inhalt":[],"meinung1":[],"meinung2":[],"erfahrung1":[],"erfahrung2":[],"vorteile":[],"nachteile":[],"planung":[]},"questions":[""],"redemittel":[""]}
Use empty arrays for structure fields that do not fit the Teil. For Teil 2, the structure fields must reflect the source topic and must clearly distinguish student vs partner roles. Keep the dialogue in German. Keep the note short. Make the dialogue, structure and questions consistent with each other.`;
  } else if(mode==='evaluate'){
    prompt=`Evaluate a TELC speaking practice session for training only. Do not claim an official telc score.
${context}
TRANSCRIPT:
${transcript}
Return ONLY JSON:
{"criteria":[{"key":"ausdruck","label":"Ausdrucksfähigkeit","score":0,"max":5,"comment":""},{"key":"aufgabe","label":"Aufgabenbewältigung","score":0,"max":5,"comment":""},{"key":"richtigkeit","label":"Formale Richtigkeit","score":0,"max":5,"comment":""},{"key":"aussprache","label":"Aussprache und Intonation","score":0,"max":5,"comment":"Aus dem Transkript nicht zuverlässig beurteilbar."},{"key":"interaktion","label":"Interaktion","score":0,"max":5,"comment":""}],"total":0,"strengths":[],"priorities":[],"summary_de":"","summary_ar":""}
Score 0-5 for each. For pronunciation explicitly say it cannot reliably be assessed from text transcript and do not pretend to hear audio. Keep feedback specific to this topic and Teil.`;
  } else {
    prompt=`Act as the exam PARTNER (not Jerry) for a realistic TELC German speaking simulation. Stay in German. Be natural, concise, and interactive. The student is the candidate and you are the independent conversation partner. Never become the examiner and never write the student's answer for them.
${context}
Student transcript:
${transcript}
Conversation history:
${JSON.stringify(history)}
Conversation state: If transcript/history is empty, this is the beginning of the exercise. For Teil 2, begin with the INHALT stage: briefly state/introduce the content as the partner and ask the student to summarize the Inhalt. After the student answers, continue through Meinung 1 -> Meinung 2 -> Erfahrung 1 -> Erfahrung 2 -> Vorteile/Nachteile.

STRICT TEIL 2 ROLE RULES:
- The first task is INHALT. The partner may briefly model/summarize the content and then ask the student to summarize the Inhalt.
- The student's own first substantive opinion is MEINUNG 1.
- The partner's next substantive opinion is MEINUNG 2. It is the PARTNER'S independent opinion, not a second answer for the student.
- The student's experience is ERFAHRUNG 1.
- The partner's experience/example is ERFAHRUNG 2. Phrase it as a plausible partner perspective/example, not a claimed real-world memory.
- Then discuss the concrete Vorteile und Nachteile from the supplied topic step by step.
- Ask only ONE main question/request at a time.
- Keep every reply in German. Never use Arabic in the conversation itself.
- Follow the actual topic points; do not invent unrelated categories.

Rules by Teil:
- Teil 1: react to the presentation and ask one relevant follow-up question.
- Teil 2: follow the role sequence above and keep the conversation natural.
- Teil 3: actively plan/negotiate; introduce or react to concrete planning points such as time, place, cost, tasks and priorities, and work toward agreement.
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
