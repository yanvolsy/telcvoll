const { db } = require('./_lib/db');
const { json } = require('./_lib/auth');
const { requireStudent, checkExerciseAccess } = require('./_lib/guard');
const { requireSameOrigin } = require('./_lib/request');

exports.handler = async (event) => {
  if (event.httpMethod !== 'GET') return json(405, { error: 'Method not allowed' });
  if (!requireSameOrigin(event)) return json(403, { error: 'Cross-origin request blocked.' });

  const student = await requireStudent(event);
  if (!student) return json(401, { error: 'unauthenticated' });

  const id = parseInt((event.queryStringParameters || {}).id || '0', 10);
  if (!id) return json(400, { error: 'Missing id' });

  try {
    const pool = db();
    const access = await checkExerciseAccess(pool, id, student);
    if (!access.allowed) {
      return json(access.status || 403, {
        error: access.error || 'access_denied',
        message: access.message || 'غير مصرح لك بالوصول إلى هذا التمرين.',
      });
    }

    const result = await pool.query(
      'SELECT position_no, prompt, correct_answer FROM items WHERE exercise_id=$1 ORDER BY position_no',
      [id]
    );
    return json(200, {
      exercise_id: id,
      details: (result.rows || []).map(item => ({
        position_no: item.position_no,
        prompt: item.prompt,
        correct_answer: item.correct_answer,
      })),
    });
  } catch (error) {
    console.error('Exercise model answer fetch error:', error);
    return json(500, { error: 'تعذر تحميل الإجابات النموذجية. حاول مرة أخرى.' });
  }
};
