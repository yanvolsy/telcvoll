const { db } = require('./_lib/db');
const { json } = require('./_lib/auth');
const { requireStudent } = require('./_lib/guard');
const { requireSameOrigin, requestSize } = require('./_lib/request');

const MAX_TEXT = 14000;
const GEMINI_MODEL = process.env.GEMINI_WRITING_MODEL || 'gemini-2.5-flash';
const GROQ_MODEL = process.env.GROQ_WRITING_MODEL || 'openai/gpt-oss-120b';

function cleanJson(text) {
  let s = String(text || '').trim();
  if (s.startsWith('```')) s = s.replace(/^```(?:json)?\s*/i, '').replace(/\s*```$/, '').trim();
  const first = s.indexOf('{');
  const last = s.lastIndexOf('}');
  if (first >= 0 && last > first) s = s.slice(first, last + 1);
  return JSON.parse(s);
}

function clamp(n, min = 0, max = 45) {
  const x = Number(n);
  return Number.isFinite(x) ? Math.max(min, Math.min(max, x)) : min;
}

function normalize(raw, provider) {
  const weights = { aufgabenbewaltigung: 15, kommunikation: 15, korrektheit: 15 };
  const fallbackLabels = {
    aufgabenbewaltigung: 'Aufgabenbewältigung',
    kommunikation: 'Kommunikative Gestaltung',
    korrektheit: 'Formale Richtigkeit'
  };
  const rawCriteria = Array.isArray(raw.criteria) ? raw.criteria : [];
  const criteria = Object.entries(weights).map(([key, max]) => {
    const c = rawCriteria.find(x => String(x.key || '').toLowerCase() === key) || rawCriteria.find(x => String(x.label || '').toLowerCase().includes(fallbackLabels[key].toLowerCase().split(' ')[0]));
    return {
      key,
      label: fallbackLabels[key],
      score: clamp(c?.score ?? 0, 0, max),
      max,
      comment: String(c?.comment || '')
    };
  });
  const overall_score = criteria.reduce((sum, c) => sum + c.score, 0);
  const corrections = Array.isArray(raw.corrections) ? raw.corrections.slice(0, 30).map(c => ({
    original: String(c.original || ''),
    corrected: String(c.corrected || ''),
    category: String(c.category || 'Sprache'),
    explanation: String(c.explanation || '')
  })).filter(c => c.original || c.corrected) : [];
  return {
    provider,
    level: String(raw.level || ''),
    overall_score,
    max_score: 45,
    criteria,
    task_completion: raw.task_completion && typeof raw.task_completion === 'object' ? {
      score: clamp(raw.task_completion.score, 0, 15),
      max: 15,
      covered_points: Array.isArray(raw.task_completion.covered_points) ? raw.task_completion.covered_points.map(String).slice(0, 12) : [],
      missing_points: Array.isArray(raw.task_completion.missing_points) ? raw.task_completion.missing_points.map(String).slice(0, 12) : []
    } : null,
    strengths: Array.isArray(raw.strengths) ? raw.strengths.map(String).slice(0, 8) : [],
    priorities: Array.isArray(raw.priorities) ? raw.priorities.map(String).slice(0, 8) : [],
    corrections,
    corrected_text: String(raw.corrected_text || ''),
    summary_de: String(raw.summary_de || ''),
    summary_ar: String(raw.summary_ar || ''),
    warning: String(raw.warning || '')
  };
}

function buildPrompt({ level, title, teil, situation, task, answer }) {
  return `Du bist ein strenger, aber fairer Schreibtrainer für TELC Deutsch ${level || 'B2'}. Du bewertest ausschließlich zu Lernzwecken; behaupte NICHT, eine offizielle telc-Prüfungsnote zu vergeben.

AUFGABE:
Analysiere den Text des Lernenden anhand der tatsächlich gegebenen Situation und Aufgabe. Erfinde keine Anforderungen, die nicht aus dem Material hervorgehen. Bewerte besonders Aufgabenbewältigung, Grammatik, Wortschatz, Ausdruck/Kohärenz, Rechtschreibung und Register. Berücksichtige das Niveau ${level || 'B2'}.

METADATEN:
Titel: ${title || ''}
Teil: ${teil || ''}

SITUATION:
${situation || '(keine separate Situation angegeben)'}

AUFGABE:
${task || '(keine separate Aufgabe angegeben)'}

TEXT DES LERNENDEN:
${answer}

BEWERTUNGSLOGIK:
- Für telc Deutsch B2 Schriftlicher Ausdruck wird die Leistung auf drei Kriterien bewertet: Aufgabenbewältigung, Kommunikative Gestaltung und Formale Richtigkeit.
- Jedes Kriterium erhält 0, 1, 3 oder 5 Rohpunkte. Für die Trainingsanzeige werden diese drei Rohwerte jeweils mit 3 multipliziert: maximal 45 Punkte insgesamt.
- Verwende für die JSON-Ausgabe direkt die skalierten Werte: 0, 3, 9 oder 15 je Kriterium. Die drei Kriterien müssen zusammen exakt maximal 45 Punkte ergeben.
- Aufgabenbewältigung: vollständige und passende Bearbeitung der Aufgabe, Auswahl der geforderten Punkte, Textsortengerechtheit.
- Kommunikative Gestaltung: angemessener Aufbau, Kohärenz/Kohäsion, Register, Anrede/Betreff/Schluss und verständliche kommunikative Umsetzung.
- Formale Richtigkeit: Grammatik, Syntax, Morphologie, Rechtschreibung und Zeichensetzung.
- Prüfe jede explizite Aufgabe bzw. jeden Punkt einzeln. Wenn ein Punkt nicht beantwortet wurde, nenne ihn.
- Korrigiere echte Fehler, aber erfinde keine Fehler bei zulässigen Varianten.
- corrected_text darf nur den Inhalt des Lernenden sprachlich verbessern; keine neuen Argumente erfinden.
- Gib maximal 30 konkrete Korrekturen aus.
- Schreibe summary_ar auf Arabisch, summary_de auf Deutsch.
- Gib ausschließlich valides JSON zurück, ohne Markdown und ohne zusätzliche Erklärung.

JSON-SCHEMA:
{
  "level": "B1|B2|C1",
  "overall_score": 0,
  "criteria": [
    {"key":"aufgabenbewaltigung","label":"Aufgabenbewältigung","score":0,"max":15,"comment":""},
    {"key":"kommunikation","label":"Kommunikative Gestaltung","score":0,"max":15,"comment":""},
    {"key":"korrektheit","label":"Formale Richtigkeit","score":0,"max":15,"comment":""}
  ],
  "task_completion": {"score":0,"max":15,"covered_points":[],"missing_points":[]},
  "strengths":[],
  "priorities":[],
  "corrections":[{"original":"","corrected":"","category":"Grammatik","explanation":""}],
  "corrected_text":"",
  "summary_de":"",
  "summary_ar":"",
  "warning":""
}`;
}

exports.handler = async (event) => {
  if (!requireSameOrigin(event)) return json(403, { error: 'Cross-origin request blocked.' });
  if (!requestSize(event)) return json(413, { error: 'Request too large.' });
  if (event.httpMethod !== 'POST') return json(405, { error: 'Method not allowed' });
  const student = await requireStudent(event);
  if (!student) return json(401, { error: 'unauthenticated' });

  let body;
  try { body = JSON.parse(event.body || '{}'); } catch { return json(400, { error: 'Bad request' }); }
  const exerciseId = parseInt(body.exercise_id || 0, 10);
  const answer = String(body.answer || '').trim();
  if (!exerciseId) return json(400, { error: 'Missing exercise_id' });
  if (!answer) return json(400, { error: 'Schreibtext ist leer.' });
  if (answer.length > MAX_TEXT) return json(413, { error: `Text too long. Maximum ${MAX_TEXT} characters.` });

  const pool = db();
  const client = await pool.connect();
  try {
    const exRes = await client.query("SELECT id, level, section, teil, title, body, settings_json, status FROM exercises WHERE id=$1", [exerciseId]);
    const exercise = exRes.rows[0];
    if (!exercise || exercise.status !== 'published') return json(404, { error: 'Exercise not found' });
    if (exercise.task_type !== 'WRITING' && exercise.section !== 'Schreiben') return json(400, { error: 'This exercise is not a Schreiben exercise.' });

    const settings = exercise.settings_json && typeof exercise.settings_json === 'object' ? exercise.settings_json : {};
    const prompt = buildPrompt({
      level: exercise.level,
      title: exercise.title,
      teil: exercise.teil,
      situation: settings.situation_text || exercise.body || '',
      task: settings.task_text || '',
      answer
    });

    let result;
    try {
      const raw = await askAI({feature:'writing',system:'Return only valid JSON. You are a TELC German writing evaluator. Never claim to provide an official telc grade.',prompt,maxTokens:1800});
      result = normalize(sharedCleanJson(raw), 'AI');
    } catch (e) {
      await logAiError('writing',e?.message||e,student.student_id);
      return json(503, { error: 'AI correction failed. Please try again later.' });
    }

    // Save the AI writing attempt so the student's progress counts it as completed.
    const score = clamp(result.overall_score, 0, 45);
    result.overall_score = score;
    const resultLabel = score >= 27 ? 'KI-Feedback bestanden' : 'KI-Feedback weiterüben';
    const attemptRes = await client.query(
      `INSERT INTO attempts(student_id,exercise_id,score,max_score,percent,finished_at,result)
       VALUES($1,$2,$3,45,$4,NOW(),$5) RETURNING id`,
      [student.student_id, exerciseId, score, Math.round(score / 45 * 10000) / 100, resultLabel]
    );
    result.attempt_id = attemptRes.rows[0].id;
    result.answer = answer;
    result.max_text = MAX_TEXT;
    return json(200, result);
  } catch (e) {
    console.error('AI writing failed', e); return json(500, { error: 'AI correction failed.' });
  } finally {
    client.release();
  }
};
