const { db, ensureSchema } = require('./db');
const { studentFromEvent, adminFromEvent } = require('./auth');

/**
 * Fetch active paid subscription for a student
 */
async function getStudentSubscription(pool, studentId) {
  if (!studentId) return { active: false, is_paid: false, plan: null, plan_name: null, plan_key: null, expires_at: null, ai_enabled: false };

  try {
    // Current source of truth: confirmed orders tied to the student.
    // Legacy access_codes are intentionally ignored; they are no longer an
    // authentication or subscription mechanism.
    const orderRes = await pool.query(
      `SELECT o.id, o.expires_at, o.plan_name,
              p.plan_key, p.duration_days, p.ai_enabled
       FROM orders o
       LEFT JOIN plans p ON p.id = o.plan_id
       WHERE o.student_id = $1
         AND o.status = 'CONFIRMED'
         AND o.expires_at > NOW()
       ORDER BY o.expires_at DESC, o.id DESC
       LIMIT 1`,
      [studentId]
    );

    if (orderRes.rows[0]) {
      const o = orderRes.rows[0];
      return {
        active: true,
        is_paid: true,
        plan: o.plan_name,
        plan_name: o.plan_name,
        plan_key: o.plan_key || 'b1_b2_c1',
        duration_days: o.duration_days || null,
        expires_at: o.expires_at,
        ai_enabled: o.ai_enabled === true,
      };
    }

    // Compatibility for subscriptions created directly on the student record.
    // This remains useful for existing customers while orders become the normal
    // source for newly confirmed payments.
    const stRes = await pool.query(
      `SELECT s.is_paid, s.plan_id, s.plan_name, s.subscription_expires_at,
              p.plan_key, p.duration_days, p.ai_enabled
       FROM students s
       LEFT JOIN plans p ON p.id = s.plan_id
       WHERE s.id = $1`,
      [studentId]
    );
    const st = stRes.rows[0];
    if (st && st.is_paid === true && st.subscription_expires_at) {
      const expires = new Date(st.subscription_expires_at);
      if (!Number.isNaN(expires.getTime()) && expires > new Date()) {
        return {
          active: true,
          is_paid: true,
          plan: st.plan_name || 'اشتراك كامل B1 · B2 · C1',
          plan_name: st.plan_name || 'اشتراك كامل B1 · B2 · C1',
          plan_key: st.plan_key || 'b1_b2_c1',
          duration_days: st.duration_days || null,
          expires_at: expires.toISOString(),
          ai_enabled: st.ai_enabled === true,
        };
      }
    }
  } catch (err) {
    console.error('Error fetching student subscription:', err);
  }

  return { active: false, is_paid: false, plan: null, plan_name: null, plan_key: null, expires_at: null, ai_enabled: false };
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

  if (!studentId) return null;

  try {
    await ensureSchema(pool);
    const sRes = await pool.query(
      `SELECT id, name, email, first_name, last_name, phone, country,
              profile_completed, is_blocked, is_paid, subscription_expires_at, session_version
       FROM students WHERE id = $1`,
      [studentId]
    );
    const s = sRes.rows[0];
    if (!s || s.is_blocked) {
      return null;
    }
    if (payload.session_version === undefined || Number(payload.session_version) !== Number(s.session_version || 0)) {
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
      ai_enabled: isPaid && subscription.ai_enabled === true,
    };
  } catch (err) {
    console.error('Error in requireStudent guard:', err);
    // Fail closed. A database failure must never turn a stale JWT into an
    // authenticated session or bypass an account block/subscription check.
    return null;
  }
}

async function requireAdmin(event) {
  const payload = adminFromEvent(event);
  if (!payload || !payload.admin_id) return null;
  try {
    const pool = db();
    await ensureSchema(pool);
    const res = await pool.query(
      'SELECT id, email, session_version FROM admins WHERE id=$1 LIMIT 1',
      [payload.admin_id]
    );
    const admin = res.rows[0];
    if (!admin) return null;
    if (payload.session_version === undefined || Number(payload.session_version) !== Number(admin.session_version || 0)) return null;
    return { admin: true, admin_id: admin.id, email: admin.email };
  } catch (err) {
    console.error('Error in requireAdmin guard:', err);
    return null;
  }
}

async function requireSession(event) {
  const admin = await requireAdmin(event);
  if (admin) return { role: 'admin', ...admin };
  const student = await requireStudent(event);
  if (student) return { role: 'student', ...student };
  return null;
}

/**
 * Check if a student is authorized to view or submit an exercise.
 * Server-side gatekeeper: NEVER trust frontend flags.
 */
async function checkExerciseAccess(pool, exerciseId, student) {
  let exercise = null;
  try {
    const exRes = await pool.query(
      "SELECT id, level, section, teil, title, task_type, access_mode, status, body, instructions, settings_json, audio_url, parent_exercise_id, deleted_at FROM exercises WHERE id=$1",
      [exerciseId]
    );
    exercise = exRes.rows[0];
  } catch (_) {
    const fallbackRes = await pool.query(
      "SELECT id, level, section, teil, title, task_type, access_mode, status, body, settings_json, audio_url, deleted_at FROM exercises WHERE id=$1",
      [exerciseId]
    );
    exercise = fallbackRes.rows[0];
  }
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
