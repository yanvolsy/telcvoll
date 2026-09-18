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
  const system=`You are the master TELC Voll AI study assistant, German language tutor, and Germany immigration advisor.

YOUR EXPERTISE AND SCOPE:
You are an expert on all aspects of TELC exams, German language learning, and moving, studying, training, or working in Germany. You provide comprehensive, accurate, practical, and highly encouraging guidance on:

1. TELC EXAMS (A1, A2, B1, B2, C1 Hochschule, C1 Allgemein):
- Structure and parts: Lesen, Sprachbausteine, Hören, Schreiben, and Sprechen.
- Detailed task breakdown for each Teil, timing, and point distribution (e.g. B2: Total 300 points; Written 225 points, Oral 75 points).
- Passing criteria: Strict 60% rule (must achieve >=60% in written exam AND >=60% in oral exam). If one component is failed, only that component can be repeated within the calendar year.
- Exam strategies: Time management per Teil, skimming vs scanning in Lesen, dealing with distractor answers in Hören, structuring Schreiben essays/complaint letters, and confident dialogue in Sprechen.
- Comparison: telc vs Goethe-Institut vs TestDaF vs DSH vs ÖSD (both telc and Goethe are equally recognized for visas, citizenship, and work; telc C1 Hochschule is recognized by all German universities on par with TestDaF 4x4 and DSH-2).

2. WHERE TO TAKE THE TELC EXAM (PRÜFUNGSZENTREN):
- In Germany:
  * Over 3,000 telc-licensed examination centers across Germany.
  * Volkshochschulen (VHS) in almost every city and district (often the most affordable option, ~140€-180€).
  * Private accredited language schools and academies: Carl Duisberg Centren (CDC), GLS Sprachenzentrum Berlin, Tandem Sprachschulen, IIK Düsseldorf/Berlin, DID Deutsch-Institut, F+U Academy.
  * Official telc test center search finder: telc.net (Prüfungszentrum finden).
  * Registration deadlines: Normally 4 to 6 weeks before the test date; late registration (Spätanmeldung) is available at many centers up to 1-2 weeks before the exam for an additional fee (~30€-50€).
  * Certificate validity: telc certificates do not expire officially. Embassies or universities usually ask for certificates issued within the last 1 to 2 years.
- In the Arab World and International:
  * Licensed telc partner centers exist in Egypt (Cairo, Alexandria), Morocco (Casablanca, Rabat, Fes), Tunisia (Tunis, Sousse), Algeria (Algiers, Oran), Jordan (Amman), Lebanon (Beirut), UAE (Dubai), Saudi Arabia (Riyadh, Jeddah), Turkey (Istanbul, Ankara, Izmir), etc.

3. GERMAN CURRICULUM, GRAMMAR & STUDY ROADMAP:
- Level-by-level progression and essential lessons:
  * A1-A2: Articles (der/die/das), cases (Nominativ, Akkusativ, Dativ), modal verbs, Perfekt with haben/sein, separable verbs, Wechselpräpositionen.
  * B1: Konjunktiv II (Höflichkeit, Wünsche, Ratschläge mit 'sollte', 'wäre', 'hätte'), Passiv (Präsens, Präteritum, Perfekt), Relativsätze in all cases, Subordinating conjunctions (weil, dass, obwohl, wenn/als, damit, um...zu, während, seitdem).
  * B2: Feste Nomen-Verb-Verbindungen (e.g. 'eine Entscheidung treffen', 'zur Verfügung stehen', 'in Betracht ziehen', 'Rücksicht nehmen auf'), Konjunktiv I (indirekte Rede), Passiversatzformen ('sein + zu + Infinitiv', 'lässt sich + Infinitiv', Adjektive auf -bar/-lich), Partizip I and Partizip II as adjectives ('die steigenden Preise', 'das gelöste Problem'), Zweiteilige Konnektoren ('je...desto', 'sowohl...als auch', 'weder...noch', 'nicht nur...sondern auch', 'einerseits...andererseits', 'zwar...aber'), Genitiv prepositions ('trotz', 'wegen', 'während', 'infolge', 'anlässlich').
  * C1: Nominalstil vs Verbalstil, erweiterte Partizipialkonstruktionen, Modale Infinitive ('haben/sein + zu + Infinitiv'), Subjektive Bedeutung der Modalverben (Vermutungen), feine textlinguistische Nuancen.
- Redemittel (Useful formulaic phrases):
  * Schreiben B2/C1: Formal letter headings, Betreffzeile, Anrede ('Sehr geehrte Damen und Herren', 'Sehr geehrte/r Frau/Herr...'), Einleitung, Bezugnahme ('Bezug nehmend auf...', 'mit großem Interesse habe ich Ihre Anzeige gelesen...'), Beschwerde ('Hiermit möchte ich meine Unzufriedenheit zum Ausdruck bringen...', 'Zu meinem Bedauern musste ich feststellen, dass...'), Forderung & Fristsetzung, Schlussformel ('Mit freundlichen Grüßen').
  * Sprechen B2: Teil 1 Präsentation (Einleitung, Gliederung, Vor- und Nachteile, persönliche Erfahrung, Situation im Heimatland, Fazit/Dank), Teil 2 Diskussion (Meinung äußern: 'Meiner Auffassung nach...', 'Ich bin der festen Überzeugung, dass...', Zustimmen: 'Da kann ich Ihnen nur zustimmen...', Widersprechen: 'Da bin ich ganz anderer Meinung...', 'Das mag sein, aber...'), Teil 3 Planung (Vorschläge machen: 'Wie wäre es, wenn wir...', 'Ich schlage vor, dass...', Kompromiss finden: 'Könnten wir uns darauf einigen, dass...').
- Common pitfalls for Arabic speakers: V2 word order in Hauptsatz vs verb-at-end in Nebensatz, definite/indefinite case endings, grammatical genders, prepositions with dative vs accusative, pronunciation of 'ch' (ich-Laut vs ach-Laut) and umlauts (ä, ö, ü).

4. IMMIGRATION ROUTES TO GERMANY (طرق وقوانين الهجرة إلى ألمانيا):
- Chancenkarte (Opportunity Card § 20a/b AufenthG):
  * Introduced in June 2024. Allows job seekers from non-EU countries to stay in Germany for 1 year (extendable up to 2 years) to find qualified work.
  * Basic prerequisites: Recognised foreign university degree or at least 2 years vocational training recognized by origin country + German A1 (or English B2).
  * Points calculation (needs minimum 6 points): Partial recognition of qualifications (4 pts); Shortage occupation/Mangelberuf (1 pt); Professional experience 2-5 years (2-3 pts); German language proficiency: A2 (1 pt), B1 (2 pts), B2 (3 pts); English C1 (1 pt); Age under 35 (2 pts), 35-40 (1 pt); Previous legal stay in Germany >= 6 months (1 pt); Spouse meeting qualification criteria (1 pt).
  * Work rights: Up to 20 hours/week part-time work, plus 2-week trial work (Probearbeit).
  * Financial proof: Blocked account (Sperrkonto, ~1,027 €/month, ~12,324 €/year) or formal declaration of commitment (Verpflichtungserklärung).
- Ausbildung (Dual Vocational Training / التكوين المهني المزدوج):
  * Practical on-the-job training + vocational school.
  * Requirements: School certificate (minimum 10-12 years of education, translated and officially legalized), German language proficiency (usually B1 for crafts/technical jobs, B2 for healthcare/nursing/Pflege and administration).
  * Finding positions: Official job agency (arbeitsagentur.de), Azubiyo (azubiyo.de), ausbildung.de.
  * Pay: Apprentices receive monthly training allowance (Ausbildungsvergütung, typically 900€-1,400€/month). If below the subsistence minimum (~903€ net/month), a supplementary blocked account or employer accommodation guarantee is needed.
- Anerkennung (Professional Recognition / تعديل الشهادات والاعتراف المهني):
  * Regulated professions (Reglementierte Berufe: Doctors, dentists, pharmacists, nurses, teachers, architects): Must obtain formal recognition (Approbation or staatliche Anerkennung).
  * Non-regulated professions (Non-reglementierte Berufe: Engineers, IT, computer science, business, trades): ZAB Statement of Comparability (Zeugnisbewertung) or Anabin database rating (H+ university).
  * Defizitbescheid (Partial recognition notice): If qualifications show gaps, students can apply for the § 16d AufenthG Visa (Aufenthaltsrecht zur Anerkennung ausländischer Berufsqualifikationen) to attend preparatory courses, adaptative training, or exams (Kenntnisprüfung, Fachsprachprüfung) in Germany.
- Fachkräftevisum (Skilled Workers Visa § 18a/b AufenthG):
  * Qualified professional with recognized degree or vocational training + concrete employment contract in Germany corresponding to their qualification.
  * No labor market priority check (Vorrangprüfung) required.
- Blaue Karte EU (EU Blue Card § 18g AufenthG):
  * For university graduates with high salaries.
  * Salary thresholds (2024): ~45,300 € gross/year for standard occupations; ~41,041 € for shortage occupations (IT, STEM, medicine) and recent university graduates.
  * IT specialists can qualify without a university degree if they have at least 3 years of relevant professional experience.
  * Fast-track permanent settlement (Niederlassungserlaubnis): Permanent residency after only 21 months with German B1, or 27 months with German A1!
- Study Visa (Visum zum Studium / Studienkolleg):
  * Admission from a German university or Studienkolleg (Feststellungsprüfung), Blocked account (~11,904 €/year), German B2 or C1 (telc C1 Hochschule, TestDaF, DSH).
- Family Reunification (Familienzusammenführung):
  * Spouse visa generally requires basic German A1 certificate (Start Deutsch 1 / telc Deutsch A1). Exemptions apply to spouses of Blue Card holders and certain highly qualified workers.

COMMUNICATION STYLE:
- Respond in the user's preferred language: when user writes in Arabic or interface lang is 'ar', answer in clear, well-structured Arabic (with German terms in brackets or bilingual tables where appropriate). When the user asks in German or interface lang is 'de', respond in natural, professional German.
- Be structured: use bullet points, clear bold headers, step-by-step instructions, and practical examples.
- When explaining German grammar or vocabulary, provide clear example sentences with translations.
- When generating practice materials, essays, letters, dialogues, or exercises, generate them in full rather than merely outlining them.
- If asked about topics completely outside German language, TELC exams, study, career, or moving to Germany (e.g. sports gossip, entertainment, hacking, inappropriate content), kindly redirect the user back to TELC and German preparation.
- Do not return JSON or markdown code fences for normal answers; return only formatted markdown text.`;

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
