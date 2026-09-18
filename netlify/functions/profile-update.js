const { db } = require('./_lib/db');
const { json } = require('./_lib/auth');
const { requireStudent } = require('./_lib/guard');
const { requireSameOrigin, requestSize } = require('./_lib/request');
const { rateLimit } = require('./_lib/ratelimit');

function clean(value, max) {
  return String(value ?? '').trim().replace(/\s+/g, ' ').slice(0, max);
}
function validEmail(value) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
}

exports.handler = async (event) => {
  if (!requireSameOrigin(event)) return json(403, { error: 'Cross-origin request blocked.' });
  if (!requestSize(event, 32 * 1024)) return json(413, { error: 'Request too large.' });
  if (event.httpMethod !== 'POST') return json(405, { error: 'Method not allowed' });

  const student = await requireStudent(event, { allowIncompleteProfile: true });
  if (!student) return json(401, { error: 'unauthenticated' });
  if (!(await rateLimit('profile_update', 20, 3600, String(student.student_id)))) {
    return json(429, { error: 'Too many profile updates. Please try again later.' });
  }

  let body;
  try { body = JSON.parse(event.body || '{}'); } catch { return json(400, { error: 'Bad request' }); }

  const firstName = clean(body.first_name, 100);
  const lastName = clean(body.last_name, 100);
  const email = clean(body.email, 190).toLowerCase();
  const phone = clean(body.phone, 40);
  const country = clean(body.country, 100);

  if (!firstName || !lastName || !email) return json(422, { error: 'required_fields' });
  if (!validEmail(email)) return json(422, { error: 'invalid_email' });

  const pool = db();
  try {
    const displayName = `${firstName} ${lastName}`.trim();
    const result = await pool.query(
      `UPDATE students
       SET name=$1, first_name=$2, last_name=$3, email=$4, phone=$5, country=$6,
           profile_completed=TRUE, profile_updated_at=NOW()
       WHERE id=$7
       RETURNING id,name,email,first_name,last_name,phone,country,profile_completed,profile_updated_at`,
      [displayName, firstName, lastName, email, phone || null, country || null, student.student_id]
    );
    if (!result.rows[0]) return json(404, { error: 'student_not_found' });
    return json(200, { ok: true, student: result.rows[0] });
  } catch (e) {
    return json(500, { error: 'profile_save_failed' });
  }
};
