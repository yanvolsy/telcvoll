const { db } = require('./_lib/db');
const { json } = require('./_lib/auth');
const { requireStudent } = require('./_lib/guard');
const { requireSameOrigin, requestSize } = require('./_lib/request');
const { rateLimit } = require('./_lib/ratelimit');

exports.handler = async (event) => {
  if (!requireSameOrigin(event)) return json(403, { error: 'Cross-origin request blocked.' });
  if (!requestSize(event)) return json(413, { error: 'Request too large.' });
  if (event.httpMethod !== 'POST') return json(405, { error: 'Method not allowed' });
  const student = await requireStudent(event);
  if (!student) return json(401, { error: 'unauthenticated' });
  if (!(await rateLimit('exercise_submit', 300, 3600, String(student.student_id)))) return json(429, { error: 'Too many submissions. Please try again later.' });

  let body;
  try { body = JSON.parse(event.body || '{}'); } catch { return json(400, { error: 'Bad request' }); }
  const id = parseInt(body.exercise_id || 0, 10);
  const answers = body.answers || {};
  if (!id) return json(400, { error: 'Missing exercise_id' });

  const pool = db();
  const client = await pool.connect();
  try {
    const exRes = await client.query("SELECT * FROM exercises WHERE id=$1 AND status='published' AND deleted_at IS NULL", [id]);
    const exercise = exRes.rows[0];
    if (!exercise) return json(404, { error: 'Not found' });

    const mode = String(exercise.access_mode || 'paid').toLowerCase();
    if (mode === 'paid' && (!student.is_paid || !student.subscription?.active)) {
      return json(403, { error: 'payment_required', message: 'هذا التمرين مدفوع ويتطلب اشتراكاً مفعلاً.' });
    }


    const itemsRes = await client.query('SELECT * FROM items WHERE exercise_id=$1 ORDER BY position_no', [id]);
    let score = 0, max = 0;
    const rows = [];
    for (const it of itemsRes.rows) {
      const given = String(answers[it.id] ?? answers[it.position_no] ?? '').trim();
      max += parseFloat(it.points);
      const ok = given !== '' && given === String(it.correct_answer ?? '');
      const pts = ok ? parseFloat(it.points) : 0;
      score += pts;
      rows.push({ it, given, ok, pts });
    }
    const pct = max ? Math.round((score / max) * 10000) / 100 : 0;
    const result = pct >= 60 ? 'Bestanden' : 'Nicht bestanden';

    await client.query('BEGIN');
    const attemptRes = await client.query(
      `INSERT INTO attempts(student_id,exercise_id,score,max_score,percent,finished_at,result)
       VALUES($1,$2,$3,$4,$5,NOW(),$6) RETURNING id`,
      [student.student_id, id, score, max, pct, result]
    );
    const attemptId = attemptRes.rows[0].id;
    for (const { it, given, ok, pts } of rows) {
      await client.query(
        'INSERT INTO answers(attempt_id,item_id,answer_text,is_correct,points) VALUES($1,$2,$3,$4,$5)',
        [attemptId, it.id, given, ok, pts]
      );
      if (!ok) {
        await client.query(
          `INSERT INTO student_errors(student_id,item_id,wrong_answer,correct_answer)
           VALUES($1,$2,$3,$4)
           ON CONFLICT (student_id,item_id) DO UPDATE SET
             error_count = student_errors.error_count + 1,
             wrong_answer = EXCLUDED.wrong_answer,
             correct_answer = EXCLUDED.correct_answer,
             last_seen_at = NOW()`,
          [student.student_id, it.id, given, it.correct_answer]
        );
      }
    }
    await client.query('COMMIT');

    return json(200, {
      score, max, percent: pct, result,
      details: rows.map(({ it, given, ok }) => ({
        prompt: it.prompt,
        given,
        ok,
        // The model solution is revealed only after submission, so the
        // correct answer can safely be returned for every item here.
        correct_answer: it.correct_answer,
        explanation: it.explanation,
      })),
    });
  } catch (e) {
    await client.query('ROLLBACK');
    return json(500, { error: 'تعذر حفظ الإجابة. حاول مرة أخرى.' });
  } finally {
    client.release();
  }
};
