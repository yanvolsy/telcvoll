const { db } = require('./_lib/db');
const { json } = require('./_lib/auth');
const { requireStudent } = require('./_lib/guard');

exports.handler = async (event) => {
  try {
    const student = await requireStudent(event, { allowIncompleteProfile: true });
    if (!student) return json(401, { authenticated: false, error: 'unauthenticated' });

    const pool = db();

    let studentData = null;
    try {
      const meRes = await pool.query(
        `SELECT id, name, email, first_name, last_name, phone, country,
                auth_provider, profile_completed, profile_updated_at, created_at, last_login_at
         FROM students WHERE id=$1`,
        [student.student_id]
      );
      studentData = meRes.rows[0] || null;
    } catch (_) {
      try {
        const meFallback = await pool.query('SELECT id, name, email, phone FROM students WHERE id=$1', [student.student_id]);
        studentData = meFallback.rows[0] || null;
      } catch (_) {}
    }

    if (!studentData) {
      studentData = {
        id: student.student_id,
        name: student.name || 'Student',
        email: student.email || '',
        phone: student.phone || '',
        profile_completed: true,
      };
    } else if (typeof studentData.profile_completed !== 'boolean') {
      studentData.profile_completed = true;
    }

    // Only expose exercise metadata to the dashboard. Full exercise bodies,
    // settings and answers are served by exercise-get after authorization.
    let exercises = [];
    try {
      const exRes = await pool.query(
        `SELECT id, level, section, teil, title, task_type,
                CASE WHEN COALESCE(access_mode, 'paid')='free' OR $1::boolean = TRUE THEN body ELSE NULL END AS body,
                CASE WHEN COALESCE(access_mode, 'paid')='free' OR $1::boolean = TRUE THEN translation ELSE NULL END AS translation,
                CASE WHEN COALESCE(access_mode, 'paid')='free' OR $1::boolean = TRUE THEN audio_url ELSE NULL END AS audio_url,
                CASE WHEN COALESCE(access_mode, 'paid')='free' OR $1::boolean = TRUE THEN settings_json ELSE NULL END AS settings_json,
                COALESCE(access_mode, 'paid') AS access_mode, status, created_at
         FROM exercises
         WHERE status='published' AND deleted_at IS NULL
           AND (COALESCE(access_mode, 'paid')='free' OR $1::boolean = TRUE)
         ORDER BY level,
           CASE section
             WHEN 'Lesen' THEN 1 WHEN 'Hören' THEN 2 WHEN 'Sprachbausteine' THEN 3
             WHEN 'Schreiben' THEN 4 WHEN 'Sprechen' THEN 5 ELSE 6 END,
           teil, id DESC`,
        [student.is_paid === true]
      );
      exercises = exRes.rows;
    } catch (err) {
      console.error('me exercise list failed:', err);
      return json(503, { error: 'تعذر تحميل بيانات الحساب حالياً.' });
    }

    let exams = [];
    try {
      const examRes = await pool.query("SELECT id,title,level,passing_percent,status FROM exams WHERE status='published' ORDER BY id DESC");
      exams = examRes.rows;
    } catch (err) { console.error('me exam list failed:', err); }

    const isPaid = !!(student.is_paid || student.subscription?.active || student.subscription?.is_paid);
    const subObj = {
      ...(student.subscription || {}),
      active: isPaid,
      is_paid: isPaid,
      plan: student.subscription?.plan || (isPaid ? 'اشتراك كامل B1 · B2 · C1' : null),
      plan_name: student.subscription?.plan_name || (isPaid ? 'اشتراك كامل B1 · B2 · C1' : null),
    };

    return json(200, {
      authenticated: true,
      student: studentData,
      subscription: subObj,
      is_paid: isPaid,
      exercises,
      exams,
      ai_enabled: isPaid && student.ai_enabled === true,
    });
  } catch (err) {
    console.error('Fatal error in me.js:', err);
    return json(500, { error: 'تعذر تحميل بيانات الحساب حالياً.' });
  }
};
