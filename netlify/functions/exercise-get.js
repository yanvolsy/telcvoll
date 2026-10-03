const { db } = require('./_lib/db');
const { json } = require('./_lib/auth');
const { requireStudent, checkExerciseAccess } = require('./_lib/guard');

exports.handler = async (event) => {
  try {
    const student = await requireStudent(event);
    if (!student) {
      return json(401, { error: 'unauthenticated', message: 'يرجى تسجيل الدخول للوصول إلى هذا التمرين.' });
    }

    const id = parseInt((event.queryStringParameters || {}).id || '0', 10);
    if (!id) return json(400, { error: 'Missing id' });

    const pool = db();

    // Strict server-side authorization check: verifies exercise access mode and student subscription
    const access = await checkExerciseAccess(pool, id, student);
    if (!access.allowed) {
      return json(access.status || 403, {
        error: access.error || 'access_denied',
        message: access.message || 'غير مصرح لك بالوصول إلى هذا المحتوى.',
        exercise: access.exercise || null,
        access_mode: access.exercise?.access_mode || 'paid',
      });
    }

    const exercise = access.exercise;

    // If revision exercise has empty body, inherit from parent_exercise_id
    if ((!exercise.body || !String(exercise.body).trim()) && exercise.parent_exercise_id) {
      try {
        const parentRes = await pool.query(
          "SELECT body, instructions, settings_json FROM exercises WHERE id=$1",
          [exercise.parent_exercise_id]
        );
        if (parentRes.rows[0]) {
          const p = parentRes.rows[0];
          if (!exercise.body && p.body) exercise.body = p.body;
          if (!exercise.instructions && p.instructions) exercise.instructions = p.instructions;
          if (p.settings_json && typeof p.settings_json === 'object') {
            exercise.settings_json = { ...p.settings_json, ...(exercise.settings_json || {}) };
          }
        }
      } catch (_) {}
    }
    // Also if body is empty but instructions contains the passage
    if ((!exercise.body || !String(exercise.body).trim()) && exercise.instructions) {
      exercise.body = exercise.instructions;
    }

    const itemsRes = await pool.query('SELECT * FROM items WHERE exercise_id=$1 ORDER BY position_no', [id]);
    const itemsRows = itemsRes.rows || [];

    const itemIds = itemsRows.map(it => it.id).filter(Boolean);
    const optionsByItemId = new Map();

    if (itemIds.length > 0) {
      try {
        const optsRes = await pool.query(
          'SELECT id, item_id, option_key, option_text FROM item_options WHERE item_id = ANY($1) ORDER BY sort_order, id',
          [itemIds]
        );
        for (const opt of optsRes.rows) {
          const list = optionsByItemId.get(opt.item_id) || [];
          list.push({ id: opt.id, option_key: opt.option_key, option_text: opt.option_text });
          optionsByItemId.set(opt.item_id, list);
        }
      } catch (_) {
        // Fallback to sequential query if ANY($1) is not supported
        for (const it of itemsRows) {
          try {
            const optsRes = await pool.query(
              'SELECT id, option_key, option_text FROM item_options WHERE item_id=$1 ORDER BY sort_order,id',
              [it.id]
            );
            optionsByItemId.set(it.id, optsRes.rows);
          } catch (_) {}
        }
      }
    }

    const items = itemsRows.map(it => ({
      id: it.id,
      position_no: it.position_no,
      prompt: it.prompt,
      body: it.body,
      settings_json: it.settings_json,
      points: it.points,
      options: optionsByItemId.get(it.id) || [],
    }));

    return json(200, {
      exercise,
      items,
      is_free: access.is_free === true,
      is_paid: student.is_paid === true,
      ai_enabled: student.ai_enabled === true,
    });
  } catch (err) {
    console.error('Fatal error in exercise-get.js:', err);
    return json(500, { error: err.message || 'Server error' });
  }
};
