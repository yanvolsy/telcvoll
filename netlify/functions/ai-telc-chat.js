const { db } = require('./_lib/db');
const { json } = require('./_lib/auth');
const { requireStudent } = require('./_lib/guard');
const { requireSameOrigin, requestSize } = require('./_lib/request');
const { rateLimit } = require('./_lib/ratelimit');

const FALLBACK_AR = 'ابقَ في موضوع TELC من فضلك. اسألني عن امتحان TELC أو التحضير له.';
const FALLBACK_DE = 'Bitte bleibe beim Thema TELC. Frage mich zur TELC-Prüfung oder zu deiner Vorbereitung.';

function cleanJson(text) {
  let s = String(text || '').trim().replace(/^```(?:json)?\s*/i, '').replace(/\s*```$/, '').trim();
  const a = s.indexOf('{'), b = s.lastIndexOf('}');
  if (a >= 0 && b > a) s = s.slice(a, b + 1);
  return JSON.parse(s);
}

function extractText(decoded) {
  return decoded?.choices?.[0]?.message?.content
    || decoded?.choices?.[0]?.text
    || decoded?.content?.[0]?.text
    || decoded?.candidates?.[0]?.content?.parts?.map(p => p.text || '').join('')
    || '';
}

async function callAI(url, key, model, messages) {
  const resp = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${key}` },
    body: JSON.stringify({
      model,
      messages,
      temperature: 0.2,
    }),
  });
  const raw = await resp.text();
  let decoded = {};
  try { decoded = JSON.parse(raw); } catch {}
  if (!resp.ok) throw new Error(extractText(decoded) || decoded?.error?.message || `AI provider error (${resp.status})`);
  return extractText(decoded) || raw;
}

async function callGemini(key, model, system, messages) {
  if (!key) throw new Error('GEMINI_API_KEY is not configured');
  const url = `https://generativelanguage.googleapis.com/v1beta/models/${encodeURIComponent(model || 'gemini-2.5-flash')}:generateContent?key=${encodeURIComponent(key)}`;
  const contents = messages
    .filter(m => m.role !== 'system')
    .map(m => ({
      role: m.role === 'assistant' ? 'model' : 'user',
      parts: [{ text: String(m.content || '') }]
    }));
  const resp = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      systemInstruction: { parts: [{ text: system }] },
      contents,
      generationConfig: { temperature: 0.2 }
    })
  });
  const data = await resp.json().catch(() => ({}));
  if (!resp.ok) throw new Error(data?.error?.message || `Gemini HTTP ${resp.status}`);
  const text = extractText(data);
  if (!text) throw new Error('Gemini returned an empty response.');
  return text;
}

async function callGroq(key, model, system, messages) {
  if (!key) throw new Error('GROQ_API_KEY is not configured');
  const resp = await fetch('https://api.groq.com/openai/v1/chat/completions', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${key}` },
    body: JSON.stringify({
      model: model || 'openai/gpt-oss-120b',
      temperature: 0.2,
      messages
    })
  });
  const data = await resp.json().catch(() => ({}));
  if (!resp.ok) throw new Error(data?.error?.message || `Groq HTTP ${resp.status}`);
  const text = extractText(data);
  if (!text) throw new Error('Groq returned an empty response.');
  return text;
}

exports.handler = async (event) => {
  if (!requireSameOrigin(event)) return json(403, { error: 'Cross-origin request blocked.' });
  if (!requestSize(event)) return json(413, { error: 'Request too large.' });
  if (event.httpMethod !== 'POST') return json(405,{error:'Method not allowed.'});
  const student = await requireStudent(event);
  if (!student) return json(401,{error:'unauthenticated'});
  if (!student.ai_enabled) return json(403,{error:'AI is not included in your plan.'});
  if (!await rateLimit('ai_telc_chat',30,3600,String(student.student_id))) return json(429,{error:'You have reached the AI usage limit for this hour.'});

  let body={};
  try { body=JSON.parse(event.body||'{}'); } catch { return json(400,{error:'Bad request.'}); }
  const message=String(body.message||'').trim().slice(0,4000);
  const history=Array.isArray(body.history)?body.history.slice(-10):[];
  const lang=body.lang==='de'?'de':'ar';
  const fallback=lang==='de'?FALLBACK_DE:FALLBACK_AR;
  const system=`You are the master TELC Voll AI study tutor and official TELC examiner specialist (focusing on TELC Deutsch B1, B2, and C1, especially B2).

YOUR ROLE & MISSION:
Provide top-tier, structured, highly motivating, and pedagogical assistance for students preparing for the TELC German examination.

CORE CAPABILITIES & EXPECTED FORMAT:
1. TELC Exam Mastery:
   - Full mastery of TELC parts, timing (e.g. official written exam: 2 hours and 20 minutes = 140 min for Lesen, Sprachbausteine, Hören, Schreiben), scoring (total 300 points: 225 schriftlich, 75 mündlich; passing score 60% = 180 points), and assessment criteria.
2. Grammar & Structure Explanations:
   - Explain complex grammar points (e.g., Passiv/Passiversatzformen, Konjunktiv II, Relativsätze mit Präpositionen, Nomen-Verb-Verbindungen, Partizipialattribute, zweigliedrige Konnektoren) clearly.
   - Always structure your explanations with:
     * **القاعدة (Die Regel)**
     * **أمثلة تطبيقية (Beispiele B2)**
     * **كلمات دلالية وفخاخ الامتحان (Signalwörter & Prüfungstipps)**
3. Text Correction & Enhancement:
   - When the student shares a sentence or letter:
     * Point out errors kindly and categorize them (Grammatik, Wortschatz, Satzbau).
     * Provide the corrected version clearly.
     * Offer a higher-level B2/C1 alternative using idiomatic Redemittel and connectors (z. B. obwohl, infolgedessen, anstatt zu, es lässt sich feststellen).
4. Writing (Schreiben) Mentorship:
   - Provide complete, realistic model letters (Beschwerdebrief, Bitte um Information) adhering strictly to TELC format: Betreffzeile, höfliche Anrede, Einleitung, Bearbeitung aller Leitpunkte, Fristsetzung/Forderung, passende Grußformel.
5. Speaking (Sprechen) Redemittel & Strategies:
   - Provide realistic expressions for Teil 1 (Präsentation), Teil 2 (Diskussion & Pro/Contra), and Teil 3 (Gemeinsam etwas planen).
6. Formatting:
   - Use clear markdown formatting: headings (###), bold (**text**), bullet points (- ), and numbered lists where appropriate so it is easy to read.
   - If the student's language is Arabic, explain in natural Arabic while presenting German words, phrases, and examples in clean German. If German, respond fully in proficient German.

SCOPE & SAFETY:
- If the user asks for something completely unrelated to German language learning, TELC preparation, or studying (e.g., programming unrelated things, sports betting, gossip, sexual/harmful content), politely refuse and invite them back to studying for TELC:
  Arabic: "ابقَ في موضوع TELC من فضلك. اسألني عن امتحان TELC أو التحضير له."
  German: "Bitte bleibe beim Thema TELC. Frage mich zur TELC-Prüfung oder zu deiner Vorbereitung."
- Greetings (hello, hi, مرحبا, السلام عليكم) are warmly welcomed: greet back cordially and suggest 2-3 topics or questions to practice.
- Do not output JSON wrappers or markdown code fences for the entire message; return readable, beautifully formatted text.`;

  const messages=[{role:'system',content:system+'\nCurrent interface language: '+(lang==='de'?'German':'Arabic')+'.'},...history.map(x=>({role:x.role==='assistant'?'assistant':'user',content:String(x.content||'').slice(0,4000)})),{role:'user',content:message}];
  const url = process.env.AI_API_URL;
  const key = process.env.AI_API_KEY;
  const geminiKey = process.env.GEMINI_API_KEY;
  const groqKey = process.env.GROQ_API_KEY;
  if (!((url && key) || geminiKey || groqKey)) {
    return json(503, { error: 'AI provider is not configured.', details: 'Set GEMINI_API_KEY or GROQ_API_KEY in Netlify environment variables.' });
  }

  try {
    let answer = '';
    let firstError = '';
    // Prefer the site's existing AI configuration. If it is absent or fails,
    // use the same Gemini -> Groq fallback already used by Schreiben.
    if (url && key) {
      try {
        answer = await callAI(url, key, process.env.AI_MODEL, messages);
      } catch (e) {
        firstError = e.message;
      }
    }
    if (!answer && geminiKey) {
      try {
        answer = await callGemini(geminiKey, process.env.GEMINI_CHAT_MODEL || process.env.GEMINI_WRITING_MODEL || 'gemini-2.5-flash', system, messages);
      } catch (e) {
        firstError = firstError ? `${firstError} | ${e.message}` : e.message;
      }
    }
    if (!answer && groqKey) {
      try {
        answer = await callGroq(groqKey, process.env.GROQ_CHAT_MODEL || process.env.GROQ_WRITING_MODEL || 'openai/gpt-oss-120b', system, messages);
      } catch (e) {
        firstError = firstError ? `${firstError} | ${e.message}` : e.message;
      }
    }
    if (!answer) throw new Error(firstError || 'No AI provider returned a response.');
    answer=String(answer||'').trim();
    if(!answer) throw new Error('The AI provider returned an empty response.');
    try {
      const parsed=cleanJson(answer);
      if(typeof parsed.answer==='string') answer=parsed.answer;
    } catch {}
    // Logging must never turn a successful AI response into a 502 if the optional log insert fails.
    try {
      await db().query('INSERT INTO ai_logs(student_id,kind,input_text,output_text) VALUES($1,$2,$3,$4)',[student.student_id,'telc_chat',message,answer]);
    } catch (_) {}
    return json(200,{allowed:true,answer});
  } catch(e) {
    return json(502,{error:'AI connection failed.',details:e.message,scopeFallback:fallback});
  }
};
