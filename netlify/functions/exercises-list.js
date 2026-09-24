const { db } = require('./_lib/db');
const { json } = require('./_lib/auth');
const { requireStudent } = require('./_lib/guard');

exports.handler = async (event) => {
  const student = await requireStudent(event);
  if (!student) return json(401, { error: 'unauthenticated' });

  const q = event.queryStringParameters || {};
  const level = (q.level || '').trim().toUpperCase();
  const section = (q.section || '').trim();

  const pool = db();
  const conditions = ["status='published'", "deleted_at IS NULL"];
  const params = [];

  if (level) {
    params.push(level);
    conditions.push(`level = $${params.length}`);
  }
  if (section) {
    params.push(section);
    conditions.push(`section = $${params.length}`);
  }

  const query = `
    SELECT id, title, body, level, section, teil, duration_minutes, exam_id,
           COALESCE(access_mode, 'paid') AS access_mode, audio_url
    FROM exercises
    WHERE ${conditions.join(' AND ')}
    ORDER BY teil ASC, id ASC
  `;

  try {
    const { rows } = await pool.query(query, params);
    return json(200, { ok: true, exercises: rows, is_paid: student.is_paid, subscription: student.subscription });
  } catch (e) {

    console.error('exercises-list error:', e);
    return json(500, { error: 'فشل تحميل قائمة التمارين' });
  }
};
