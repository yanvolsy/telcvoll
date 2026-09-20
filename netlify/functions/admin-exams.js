const { db } = require('./_lib/db');
const { json } = require('./_lib/auth');
const { requireAdmin } = require('./_lib/guard');
const { requireSameOrigin, requestSize } = require('./_lib/request');

exports.handler = async (event) => {
  if (!requireSameOrigin(event)) return json(403, { error: 'Cross-origin request blocked.' });
  if (!requestSize(event)) return json(413, { error: 'Request too large.' });
  if (!requireAdmin(event)) return json(401, { error: 'unauthenticated' });
  const pool = db();

  if (event.httpMethod === 'POST') {
    let body;
    try { body = JSON.parse(event.body || '{}'); } catch { return json(400, { error: 'Bad request' }); }

    const client = await pool.connect();
    try {
      await client.query('BEGIN');
      const examRes = await client.query(
        `INSERT INTO exams(title,level,passing_percent,status) VALUES($1,$2,$3,'published') RETURNING id`,
        [body.title, ['B1','B2','C1'].includes(String(body.level||'')) ? String(body.level) : 'B2', parseFloat(body.passing || 60)]
      );
      const examId = examRes.rows[0].id;

      const parts = body.parts || [];
      for (let i = 0; i < parts.length; i++) {
        const part = parts[i];
        const partRes = await client.query(
          `INSERT INTO exam_parts(exam_id,section,teil,sort_order,duration_seconds,required_exercises)
           VALUES($1,$2,$3,$4,$5,$6) RETURNING id`,
          [examId, part.section, part.teil, i + 1, parseInt(part.duration || 0, 10), parseInt(part.required || 1, 10)]
        );
        const partId = partRes.rows[0].id;
        const ids = String(part.exercise_ids || '')
          .split(',')
          .map((s) => parseInt(s.trim(), 10))
          .filter((n) => Number.isInteger(n) && n > 0);
        for (let j = 0; j < ids.length; j++) {
          await client.query(
            `INSERT INTO exam_exercises(exam_part_id,exercise_id,sort_order)
             VALUES($1,$2,$3) ON CONFLICT DO NOTHING`,
            [partId, ids[j], j + 1]
          );
        }
      }
      await client.query('COMMIT');
      return json(200, { ok: true, id: examId });
    } catch (e) {
      await client.query('ROLLBACK');
      return json(500, { error: e.message });
    } finally {
      client.release();
    }
  }

  const exercises = (await pool.query(
    "SELECT id,level,section,teil,title,status FROM exercises WHERE deleted_at IS NULL ORDER BY id DESC"
  )).rows;
  const exams = (await pool.query('SELECT * FROM exams ORDER BY id DESC')).rows;
  return json(200, { exercises, exams });
};
