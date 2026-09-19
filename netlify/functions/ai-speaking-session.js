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
  const activeTeil = requestedTeil || String(ex.teil || 'Teil 1').trim();
  const isTeil3 = /Teil\s*3/i.test(activeTeil);
  const isTeil2 = /Teil\s*2/i.test(activeTeil);

  const context=`LEVEL: ${ex.level||''}\nTEIL: ${activeTeil}\nTHEMA: ${ex.title||''}\nTASK:\n${ex.body||''}`;
  let prompt;
  if(mode==='opening'){
    if(isTeil3){
      prompt=`You are the conversation Partner (Candidate B, not Jerry the examiner) in a TELC Sprechen Teil 3 practice session.
The examiner Jerry has just told the candidates to plan the task together.
Speak ONLY German.
Your job is to start the joint planning dialogue naturally, warmly, and realistically (exactly like TELC B2/C1 exam practice):
1) Greet the student (e.g. "Hallo! Schön, dich zu sehen!").
2) Refer directly to the specific project/event to be planned from the supplied topic (e.g. "Hast du schon gehört? Wir sollen gemeinsam [Thema/Aufgabe] planen.").
3) Propose getting started with the first planning point, or ask the student what they think we should do first (e.g. "Was meinst du, wie fangen wir am besten an? Hast du schon eine Idee dazu?").
Keep it friendly, natural, and concise (2-3 short sentences). Do NOT discuss Inhalt, Meinung, or personal experience. Do NOT give away the entire plan yet. Speak ONLY German.
${context}
Return ONLY JSON: {"reply":""}`;
    } else {
      prompt=`You are the Partner in a TELC B2 Sprechen Teil 2 training exercise. Speak ONLY German. The examiner Jerry has just instructed the candidates to discuss the topic. Your job is to start the partner side naturally: briefly summarize the core INHALT of the supplied topic in 1-2 sentences, then ask the student to summarize the Inhalt in their own words. Do not give Meinung 1 or Meinung 2 yet. Do not use Arabic. Do not invent information outside the supplied topic.
${context}
Return ONLY JSON: {"reply":""}`;
    }
  } else if(mode==='model'){
    if(isTeil3){
      prompt=`Create a realistic, high-quality TELC Sprechen Teil 3 (Gemeinsam etwas planen / organisieren) training model based ONLY on the supplied topic and task.
${context}

CRITICAL RULES FOR TEIL 3 — JOINT PLANNING DIALOGUE:
- This is a JOINT PLANNING AND NEGOTIATION DIALOGUE between two candidates (student and partner) to plan an event, project, or solve a problem.
- Absolutely NO "Inhalt", NO "Meinung 1 / Meinung 2", NO "Erfahrung 1 / Erfahrung 2", NO "Vorteile und Nachteile" monologues!
- Follow the authentic TELC exam format (like in the official practice tests):
  1) Start naturally with a short friendly greeting ("Hallo! Schön, dich zu sehen...") and mention the planning task.
  2) Go step-by-step through ALL the concrete Aufgaben / planning tasks from the prompt.
  3) For each point: one partner makes a concrete proposal ("Wie wäre es, wenn...", "Wir könnten..."), the other reacts (enthusiastic agreement, or polite alternative with reasons: "Das ist eine gute Idee, aber wir könnten auch..."), and they agree.
  4) Distribute tasks and responsibilities clearly ("Ich kann mich um X kümmern, übernimmst du Y?").
  5) Arrange the next meeting / next steps ("Wann und wo treffen wir uns wieder?").
  6) Conclude with a warm shared agreement ("Perfekt, dann machen wir das so. Bis dann!").
- Write 12 to 18 dialogue turns alternating between 'student' and 'partner'. Every line must have speaker 'student' or 'partner' and phase 'planung' (final line 'abschluss').
- For structure in Teil 3:
  - "planung": [array of the concrete planning steps agreed upon]
  - "verteilung": [array of tasks assigned to student vs partner]
  - "vereinbarung": [final shared agreement and next meeting details]
  - Keep inhalt, meinung1, meinung2, erfahrung1, erfahrung2, vorteile, nachteile as empty arrays [].
- PRACTICE QUESTIONS WITH SUGGESTED ANSWERS:
  Generate 4-6 practice questions that an examiner or partner might ask regarding this planning task, AND PROVIDE A CONCRETE SUGGESTED ANSWER FOR EACH!
  Format each question as an object: {"question": "Frage auf Deutsch", "answer": "Vorgeschlagene Musterantwort auf Deutsch (1-2 Sätze)"}.
- REDEMITTEL FOR TEIL 3:
  Generate 6-8 useful Redemittel specifically for planning, proposing, agreeing, polite alternatives, task distribution, and concluding.

Return ONLY JSON in this exact shape:
{"title":"Gemeinsam etwas planen","note":"Trainingsbeispiel für TELC Sprechen Teil 3","dialogue":[{"speaker":"student|partner","phase":"planung|abschluss","text":""}],"structure":{"inhalt":[],"meinung1":[],"meinung2":[],"erfahrung1":[],"erfahrung2":[],"vorteile":[],"nachteile":[],"planung":[],"verteilung":[],"vereinbarung":[]},"questions":[{"question":"","answer":""}],"redemittel":[""]}`;
    } else {
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

Generate 8-12 dialogue turns for Teil 2 so that all required roles are clearly demonstrated. Use only speaker values student and partner. Add a phase to every dialogue line using one of: inhalt, meinung1, meinung2, erfahrung1, erfahrung2, vorteile, nachteile, abschluss.
Generate 4-6 practice questions WITH SUGGESTED ANSWERS. Format each as: {"question":"","answer":""}. Generate 5-8 useful Redemittel suitable for the actual topic and Teil.

Return ONLY JSON in this exact shape:
{"title":"","note":"","dialogue":[{"speaker":"student|partner","phase":"","text":""}],"structure":{"inhalt":[],"meinung1":[],"meinung2":[],"erfahrung1":[],"erfahrung2":[],"vorteile":[],"nachteile":[],"planung":[],"verteilung":[],"vereinbarung":[]},"questions":[{"question":"","answer":""}],"redemittel":[""]}`;
    }
  } else if(mode==='evaluate'){
    if(isTeil3){
      prompt=`Evaluate a TELC speaking practice session for TEIL 3 (Gemeinsam etwas planen / organisieren).
${context}
TRANSCRIPT:
${transcript}
Evaluate specifically for TEIL 3 criteria:
1) Aufgabenbewältigung: Did the candidates address the required planning tasks from the prompt and find practical solutions?
2) Interaktion: Did the student actively participate, propose ideas, react to the partner's suggestions, ask questions, negotiate, and reach a consensus?
3) Ausdrucksfähigkeit: Appropriate B2/C1 vocabulary and Redemittel for planning, suggesting, agreeing, and organizing.
4) Formale Richtigkeit: Grammar, sentence structures, and syntax.
5) Aussprache und Intonation: Note that pronunciation cannot be reliably assessed from text.
IMPORTANT: Do NOT penalize or expect an introduction, monologue presentation, or personal opinion essay — this is Teil 3 (Joint Planning).
Return ONLY JSON:
{"criteria":[{"key":"ausdruck","label":"Ausdrucksfähigkeit","score":0,"max":5,"comment":""},{"key":"aufgabe","label":"Aufgabenbewältigung","score":0,"max":5,"comment":""},{"key":"richtigkeit","label":"Formale Richtigkeit","score":0,"max":5,"comment":""},{"key":"aussprache","label":"Aussprache und Intonation","score":0,"max":5,"comment":"Aus dem Transkript nicht zuverlässig beurteilbar."},{"key":"interaktion","label":"Interaktion","score":0,"max":5,"comment":""}],"total":0,"strengths":[],"priorities":[],"summary_de":"","summary_ar":""}`;
    } else {
      prompt=`Evaluate a TELC speaking practice session for training only. Do not claim an official telc score.
${context}
TRANSCRIPT:
${transcript}
Return ONLY JSON:
{"criteria":[{"key":"ausdruck","label":"Ausdrucksfähigkeit","score":0,"max":5,"comment":""},{"key":"aufgabe","label":"Aufgabenbewältigung","score":0,"max":5,"comment":""},{"key":"richtigkeit","label":"Formale Richtigkeit","score":0,"max":5,"comment":""},{"key":"aussprache","label":"Aussprache und Intonation","score":0,"max":5,"comment":"Aus dem Transkript nicht zuverlässig beurteilbar."},{"key":"interaktion","label":"Interaktion","score":0,"max":5,"comment":""}],"total":0,"strengths":[],"priorities":[],"summary_de":"","summary_ar":""}
Score 0-5 for each. For pronunciation explicitly say it cannot reliably be assessed from text transcript and do not pretend to hear audio. Keep feedback specific to this topic and Teil.`;
    }
  } else {
    if(isTeil3){
      prompt=`Act as the exam PARTNER (Candidate B, not Jerry the examiner) in a TELC German speaking simulation for TEIL 3: GEMEINSAM ETWAS PLANEN / ORGANISIEREN.
Stay strictly in German. Be natural, concise, friendly, and cooperative.
CRITICAL RULES FOR TEIL 3:
- This is a joint planning dialogue between two equal candidates. Never give a lecture or monologue.
- DO NOT ask for "Inhalt", DO NOT ask for "Meinung 1 / Meinung 2", DO NOT ask for personal stories/Erfahrungen, DO NOT give a presentation.
- Focus strictly on the concrete planning tasks (Aufgaben) in the supplied topic.
- In each turn:
  1) React to what the student just proposed (e.g. agree warmly: "Das ist eine super Idee!", or agree with a constructive addition: "Genau, und wir könnten auch...", or suggest a polite alternative with a reason: "Das klingt gut, aber denkst du nicht, dass...? Wie wäre es mit...?").
  2) Advance the planning by asking about or proposing the next task/point from the Aufgaben (e.g. "Was machen wir eigentlich mit...?", "Wer kümmert sich um...?").
  3) Ask for the student's opinion ("Was meinst du dazu?", "Passt das für dich?").
- When all tasks have been discussed:
  - Agree on who does what (task distribution).
  - Arrange when and where to meet next ("Wann treffen wir uns wieder?").
  - Finalize the agreement cheerfully ("Abgemacht! Dann haben wir alles Wichtige geplant. Bis dann!").
- Keep every reply concise (2-3 sentences max) so the student has space to talk.
- Never write the student's answer for them. Never use Arabic or English in the conversation.
${context}
Student transcript:
${transcript}
Conversation history:
${JSON.stringify(history)}
Return ONLY JSON: {"reply":"","short_note":"","continue":true}`;
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
    if(out && Array.isArray(out.questions)){
      out.questions = out.questions.map(item => {
        if(typeof item === 'string') return { question: item, answer: '' };
        return {
          question: String(item.question || item.q || item.title || '').trim(),
          answer: String(item.answer || item.a || item.solution || item.model || '').trim()
        };
      });
    }
    await db().query('INSERT INTO ai_logs(student_id,kind,input_text,output_text) VALUES($1,$2,$3,$4)',
      [student.student_id,'speaking',JSON.stringify({exercise_id:id,mode,transcript}),JSON.stringify(out)]);
    return json(200,out);
  }catch(e){ return json(502,{error:e.message}); }
};
