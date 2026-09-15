const { db } = require('./_lib/db');
const { json } = require('./_lib/auth');
const { requireStudent } = require('./_lib/guard');

exports.handler = async (event) => {
  const student = await requireStudent(event);
  if (!student) return json(401, { error: 'unauthenticated' });

  const pool = db();
  const { rows } = await pool.query(
    "SELECT * FROM summaries WHERE status='published' ORDER BY section, teil, id DESC"
  );
  return json(200, { summaries: rows });
};
