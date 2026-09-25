const { db } = require('./db');
const { studentFromEvent, adminFromEvent } = require('./auth');

/**
 * Fetch active paid subscription for a student
 */
async function getStudentSubscription(pool, studentId) {
  if (!studentId) return { active: false, plan: null, plan_key: null, expires_at: null, ai_enabled: false };
  try {
    // 1. Check access_codes for unexpired active codes
    const codeRes = await pool.query(
      `SELECT c.id AS code_id, c.expires_at, p.name AS plan_name, p.plan_key, p.duration_days, p.ai_enabled
       FROM access_codes c
       JOIN plans p ON p.id = c.plan_id
       WHERE c.student_id = $1 AND c.active = TRUE AND c.expires_at > NOW()
       ORDER BY c.expires_at DESC LIMIT 1`,
      [studentId]
    );
    if (codeRes.rows[0]) {
      const c = codeRes.rows[0];
      return {
        active: true,
        plan: c.plan_name,
        plan_name: c.plan_name,
        plan_key: c.plan_key,
        duration_days: c.duration_days,
        expires_at: c.expires_at,
        ai_enabled: !!c.ai_enabled,
      };
    }

    // 2. Fallback check for CONFIRMED orders with unexpired subscription
    const orderRes = await pool.query(
      `SELECT o.id, o.expires_at, o.plan_name, p.plan_key, p.duration_days, p.ai_enabled
       FROM orders o
       LEFT JOIN plans p ON p.id = o.plan_id
       WHERE o.student_id = $1 AND o.status = 'CONFIRMED' AND o.expires_at > NOW()
       ORDER BY o.expires_at DESC LIMIT 1`,
      [studentId]
    );
    if (orderRes.rows[0]) {
      const o = orderRes.rows[0];
      return {
        active: true,
        plan: o.plan_name,
        plan_name: o.plan_name,
        plan_key: o.plan_key,
        duration_days: o.duration_days,
        expires_at: o.expires_at,
        ai_enabled: o.ai_enabled !== false,
      };
    }
  } catch (err) {
    console.error('Error fetching student subscription:', err);
  }

  return { active: false, plan: null, plan_name: null, plan_key: null, expires_at: null, ai_enabled: false };
}

/**
 * requireStudent guard:
 * Verifies authenticated student session (via HttpOnly cookie or Authorization Bearer header).
 * Works for BOTH Free and Paid students.
 * Returns authenticated student object with subscription state.
 */
async function requireStudent(event, options = {}) {
  const payload = studentFromEvent(event);
  if (!payload) return null;

  const pool = db();
  let studentId = payload.student_id;

  // Legacy fallback if only code_id is present
  if (!studentId && payload.code_id) {
    try {
      const cRes = await pool.query('SELECT student_id FROM access_codes WHERE id=$1', [payload.code_id]);
      studentId = cRes.rows[0]?.student_id;
    } catch (_) {}
  }

  if (!studentId) return null;

  try {
    const sRes = await pool.query(
      `SELECT id, name, email, first_name, last_name, phone, country,
              profile_completed, is_blocked
       FROM students WHERE id = $1`,
      [studentId]
    );
    const s = sRes.rows[0];
    if (!s || s.is_blocked) {
      return null;
    }

    const subscription = await getStudentSubscription(pool, s.id);
    const isPaid = subscription.active === true;

    return {
      student_id: s.id,
      id: s.id,
      name: s.name || `${s.first_name || ''} ${s.last_name || ''}`.trim() || 'Student',
      first_name: s.first_name || '',
      last_name: s.last_name || '',
      email: s.email || '',
      phone: s.phone || '',
      country: s.country || '',
      profile_completed: s.profile_completed !== false,
      subscription,
      is_paid: isPaid,
      ai_enabled: isPaid ? (subscription.ai_enabled || true) : false,
    };
  } catch (err) {
    console.error('Error in requireStudent guard:', err);
    // Transient DB error fallback: trust valid unexpired JWT
    return {
      student_id: studentId,
      id: studentId,
      name: payload.name || 'Student',
      email: payload.email || '',
      profile_completed: true,
      subscription: { active: false, plan: null, expires_at: null },
      is_paid: false,
      ai_enabled: false,
    };
  }
}

function requireAdmin(event) {
  return adminFromEvent(event);
}

async function requireSession(event) {
  const admin = adminFromEvent(event);
  if (admin) return { role: 'admin' };
  const student = await requireStudent(event);
  if (student) return { role: 'student', ...student };
  return null;
}

/**
 * Check if a student is authorized to view or submit an exercise.
 * Server-side gatekeeper: NEVER trust frontend flags.
 */
async function checkExerciseAccess(pool, exerciseId, student) {
  const exRes = await pool.query(
    "SELECT id, level, section, teil, title, task_type, access_mode, status, body, settings_json, audio_url, duration_minutes, deleted_at FROM exercises WHERE id=$1",
    [exerciseId]
  );
  const exercise = exRes.rows[0];
  if (!exercise || exercise.deleted_at || exercise.status !== 'published') {
    return { allowed: false, status: 404, error: 'Exercise not found' };
  }

  const mode = String(exercise.access_mode || 'paid').toLowerCase();
  if (mode === 'free') {
    return { allowed: true, exercise, is_free: true };
  }

  // Paid exercise: requires student to be authenticated with active paid subscription
  if (!student) {
    return {
      allowed: false,
      status: 401,
      error: 'unauthenticated',
      message: 'يرجى تسجيل الدخول للوصول إلى هذا المحتوى.',
    };
  }

  if (student.is_paid && student.subscription?.active) {
    return { allowed: true, exercise, is_free: false };
  }

  return {
    allowed: false,
    status: 403,
    error: 'payment_required',
    message: 'هذا التمرين مدفوع ويتطلب اشتراكاً مفعلاً في منصة TELC Voll.',
    exercise: {
      id: exercise.id,
      title: exercise.title,
      level: exercise.level,
      section: exercise.section,
      teil: exercise.teil,
      access_mode: 'paid',
    },
  };
}

module.exports = {
  requireStudent,
  requireAdmin,
  requireSession,
  getStudentSubscription,
  checkExerciseAccess,
};
