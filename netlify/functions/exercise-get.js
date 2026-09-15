const { db } = require('./_lib/db');
const { json } = require('./_lib/auth');
const { requireStudent } = require('./_lib/guard');

exports.handler = async (event) => {
  const student = await requireStudent(event);
  if (!student) return json(401, { error: 'unauthenticated' });

  const id = parseInt((event.queryStringParameters || {}).id || '0', 10);
  if (!id) return json(400, { error: 'Missing id' });

  const pool = db();
  // Keep exercise loading read-only and fast: schema migrations must not run on every page view.
  // We filter deleted exercises in application code so older databases without deleted_at also remain compatible.
  const exRes = await pool.query("SELECT * FROM exercises WHERE id=$1 AND status='published'", [id]);
  const exercise = exRes.rows[0];
  if (!exercise || exercise.deleted_at) return json(404, { error: 'Exercise not found' });

  const itemsRes = await pool.query('SELECT * FROM items WHERE exercise_id=$1 ORDER BY position_no', [id]);
  const items = [];
  for (const it of itemsRes.rows) {
    const optsRes = await pool.query(
      'SELECT id, option_key, option_text FROM item_options WHERE item_id=$1 ORDER BY sort_order,id',
      [it.id]
    );
    // Never send correct_answer to the client — only what's needed to render the question.
    items.push({
      id: it.id,
      position_no: it.position_no,
      prompt: it.prompt,
      points: it.points,
      options: optsRes.rows,
    });
  }

  return json(200, { exercise, items });
};
