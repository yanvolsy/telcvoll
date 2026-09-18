const { db } = require('./_lib/db');
const { json } = require('./_lib/auth');
const { requireStudent } = require('./_lib/guard');
const { requireSameOrigin, requestSize } = require('./_lib/request');
const { rateLimit } = require('./_lib/ratelimit');

exports.handler = async (event) => {
  if (!requireSameOrigin(event)) return json(403, { error: 'Cross-origin request blocked.' });
  if (!requestSize(event)) return json(413, { error: 'Request too large.' });
  if (event.httpMethod !== 'POST') return json(405, { error: 'Method not allowed.' });
  const student = await requireStudent(event);
  if (!student) return json(401, { error: 'unauthenticated' });
  if (!student.ai_enabled) return json(403, { error: 'AI is not included in your plan.' });

  const allowed = await rateLimit('ai_call', 20, 3600, String(student.student_id));
  if (!allowed) return json(429, { error: 'You have reached the AI usage limit for this hour. Please try again later.' });

  let body;
  try { body = JSON.parse(event.body || '{}'); } catch { body = {}; }

  const url = process.env.AI_API_URL;
  const key = process.env.AI_API_KEY;
  if (!url || !key) return json(503, { error: 'AI provider is not configured.' });

  const kind = body.kind === 'writing' ? 'writing' : 'speaking';
  const text = String(body.text || '').trim().slice(0, 4000);
  if (!text) return json(422, { error: 'Please provide some text to analyze.' });

  const prompt = kind === 'speaking'
    ? `You are a strict TELC Voll B2 speaking trainer. Analyze this learner input. Return: strengths, grammar errors with corrections, vocabulary improvements, fluency advice, likely jury/partner questions, model answers, and a score estimate. German output, concise and structured. INPUT:\n${text}`
    : `You are a TELC Voll B2 tutor. Analyze the following writing. Give criteria-based feedback, corrections, score estimate and improved version.\n${text}`;

  try {
    const resp = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${key}` },
      body: JSON.stringify({
        model: process.env.AI_MODEL,
        messages: [
          { role: 'system', content: 'TELC Voll B2 tutor.' },
          { role: 'user', content: prompt },
        ],
      }),
    });
    const raw = await resp.text();
    let outText = '';
    try {
      const decoded = JSON.parse(raw);
      outText = decoded?.choices?.[0]?.message?.content || decoded?.content?.[0]?.text || '';
    } catch { /* leave outText empty, still log raw */ }

    await db().query(
      'INSERT INTO ai_logs(student_id,kind,input_text,output_text) VALUES($1,$2,$3,$4)',
      [student.student_id, kind, text, outText]
    );

    return { statusCode: resp.status, headers: { 'Content-Type': 'application/json; charset=utf-8' }, body: raw };
  } catch (e) {
    console.error('AI proxy failed', e); return json(502, { error: 'AI service temporarily unavailable.' });
  }
};
