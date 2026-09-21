// Payment Security & Abuse Protection Layer
// Handles IP/Email Rate Limiting, Fast Duplicate Prevention, and Safe Logging.

const inMemory = {
  ip: new Map(),
  email: new Map(),
  duplicates: new Map(),
};

// Periodic in-memory prune to prevent memory leaks in long-lived lambdas
function pruneMemoryCache() {
  const now = Date.now();
  const tenMinutesAgo = now - 10 * 60 * 1000;
  const sixtySecondsAgo = now - 60 * 1000;

  for (const [ip, times] of inMemory.ip.entries()) {
    const fresh = times.filter(t => t > tenMinutesAgo);
    if (fresh.length) inMemory.ip.set(ip, fresh);
    else inMemory.ip.delete(ip);
  }

  for (const [email, times] of inMemory.email.entries()) {
    const fresh = times.filter(t => t > tenMinutesAgo);
    if (fresh.length) inMemory.email.set(email, fresh);
    else inMemory.email.delete(email);
  }

  for (const [key, time] of inMemory.duplicates.entries()) {
    if (time <= sixtySecondsAgo) inMemory.duplicates.delete(key);
  }
}

/**
 * Extract real client IP from Netlify request headers
 */
function getClientIp(event) {
  const h = event.headers || {};
  const xNfIp = h['x-nf-client-connection-ip'];
  if (xNfIp) return cleanIp(xNfIp);

  const clientIp = h['client-ip'];
  if (clientIp) return cleanIp(clientIp);

  const xForwarded = h['x-forwarded-for'];
  if (xForwarded) {
    const parts = String(xForwarded).split(',').map(s => cleanIp(s)).filter(Boolean);
    if (parts.length > 0) return parts[0];
  }

  const xReal = h['x-real-ip'];
  if (xReal) return cleanIp(xReal);

  return '127.0.0.1';
}

function cleanIp(raw) {
  if (!raw) return '127.0.0.1';
  let ip = String(raw).trim();
  // Strip IPv4-mapped IPv6 prefix ::ffff:
  if (ip.startsWith('::ffff:')) ip = ip.substring(7);
  return ip || '127.0.0.1';
}

/**
 * Normalize email (trim + lowercase)
 */
function normalizeEmail(raw) {
  return String(raw || '').trim().toLowerCase();
}

/**
 * Safe logging helper that strips all sensitive keys
 */
function safeLog(tag, details = {}) {
  const sanitized = { ...details };
  const sensitiveKeys = ['key', 'api_key', 'apikey', 'secret', 'token', 'authorization', 'x-access-token', 'card', 'cvv', 'password'];

  for (const k of Object.keys(sanitized)) {
    if (sensitiveKeys.some(s => k.toLowerCase().includes(s))) {
      delete sanitized[k];
    }
  }

  console.log(`[PAYMENT_SECURITY][${tag}]`, JSON.stringify({
    timestamp: new Date().toISOString(),
    ...sanitized
  }));
}

/**
 * Ensures payment_attempts table exists (lazy bootstrap)
 */
let tableChecked = false;
async function ensureAttemptsTable(pool) {
  if (tableChecked) return;
  try {
    await pool.query(`
      CREATE TABLE IF NOT EXISTS payment_attempts (
        id BIGSERIAL PRIMARY KEY,
        ip_address VARCHAR(45) NOT NULL,
        email VARCHAR(190) NOT NULL,
        plan_id INT NULL,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
      );
      CREATE INDEX IF NOT EXISTS idx_payment_attempts_ip_time ON payment_attempts(ip_address, created_at DESC);
      CREATE INDEX IF NOT EXISTS idx_payment_attempts_email_time ON payment_attempts(email, created_at DESC);
      CREATE INDEX IF NOT EXISTS idx_payment_attempts_dup ON payment_attempts(email, plan_id, created_at DESC);
      ALTER TABLE orders ADD COLUMN IF NOT EXISTS ip_address VARCHAR(45);
    `);
    tableChecked = true;
  } catch (err) {
    // Non-fatal if already existing or concurrent
    tableChecked = true;
  }
}

/**
 * Check payment rate limit:
 * 1. IP <= 5 attempts / 10 min
 * 2. Email <= 3 attempts / 10 min
 * 3. Duplicate: Same email + same plan within 60s
 */
async function checkPaymentRateLimit(pool, { ip, email, planId }) {
  pruneMemoryCache();
  const now = Date.now();
  const tenMinutesAgo = now - 10 * 60 * 1000;
  const sixtySecondsAgo = now - 60 * 1000;

  // 1. Fast In-Memory Guard (first line of defense)
  const dupKey = `${email}:${planId}`;
  const lastAttemptTime = inMemory.duplicates.get(dupKey) || 0;
  if (lastAttemptTime > sixtySecondsAgo) {
    safeLog('DUPLICATE_BLOCKED_MEM', { ip, email, planId });
    return {
      allowed: false,
      status: 429,
      reason: 'duplicate_request',
      message: 'لديك عملية دفع قيد المعالجة بالفعل. يرجى الانتظار قليلًا.'
    };
  }

  const ipMemTimes = (inMemory.ip.get(ip) || []).filter(t => t > tenMinutesAgo);
  if (ipMemTimes.length >= 5) {
    safeLog('IP_RATE_LIMIT_MEM', { ip, email, count: ipMemTimes.length });
    return {
      allowed: false,
      status: 429,
      reason: 'ip_rate_limit',
      message: 'تم تجاوز عدد محاولات الدفع المسموح بها مؤقتًا. يرجى المحاولة لاحقًا.'
    };
  }

  const emailMemTimes = (inMemory.email.get(email) || []).filter(t => t > tenMinutesAgo);
  if (emailMemTimes.length >= 3) {
    safeLog('EMAIL_RATE_LIMIT_MEM', { ip, email, count: emailMemTimes.length });
    return {
      allowed: false,
      status: 429,
      reason: 'email_rate_limit',
      message: 'تم تجاوز عدد محاولات الدفع المسموح بها مؤقتًا لهذا البريد الإلكتروني. يرجى المحاولة لاحقًا.'
    };
  }

  // 2. Persistent Database Check (cross-instance source of truth for Netlify)
  if (pool) {
    try {
      await ensureAttemptsTable(pool);

      // Check Fast Duplicate (within 60 seconds) in payment_attempts & orders
      const dupQuery = await pool.query(
        `SELECT id, created_at FROM payment_attempts
         WHERE email=$1 AND plan_id=$2 AND created_at > NOW() - INTERVAL '60 seconds'
         LIMIT 1`,
        [email, planId]
      );
      if (dupQuery.rows.length > 0) {
        safeLog('DUPLICATE_BLOCKED_DB', { ip, email, planId });
        return {
          allowed: false,
          status: 429,
          reason: 'duplicate_request',
          message: 'لديك عملية دفع قيد المعالجة بالفعل. يرجى الانتظار قليلًا.'
        };
      }

      // Check recent pending order in orders table within 60s
      const pendingOrderQuery = await pool.query(
        `SELECT id FROM orders
         WHERE customer_email=$1 AND plan_id=$2 AND status='PENDING' AND created_at > NOW() - INTERVAL '60 seconds'
         LIMIT 1`,
        [email, planId]
      );
      if (pendingOrderQuery.rows.length > 0) {
        safeLog('DUPLICATE_PENDING_ORDER_BLOCKED_DB', { ip, email, planId });
        return {
          allowed: false,
          status: 429,
          reason: 'duplicate_request',
          message: 'لديك عملية دفع قيد المعالجة بالفعل. يرجى الانتظار قليلًا.'
        };
      }

      // Check IP Limit (max 5 per 10 min)
      const ipQuery = await pool.query(
        `SELECT COUNT(*)::int AS count FROM payment_attempts
         WHERE ip_address=$1 AND created_at > NOW() - INTERVAL '10 minutes'`,
        [ip]
      );
      const ipCount = ipQuery.rows[0]?.count || 0;
      if (ipCount >= 5) {
        safeLog('IP_RATE_LIMIT_DB', { ip, email, count: ipCount });
        return {
          allowed: false,
          status: 429,
          reason: 'ip_rate_limit',
          message: 'تم تجاوز عدد محاولات الدفع المسموح بها مؤقتًا. يرجى المحاولة لاحقًا.'
        };
      }

      // Check Email Limit (max 3 per 10 min)
      const emailQuery = await pool.query(
        `SELECT COUNT(*)::int AS count FROM payment_attempts
         WHERE email=$1 AND created_at > NOW() - INTERVAL '10 minutes'`,
        [email]
      );
      const emailCount = emailQuery.rows[0]?.count || 0;
      if (emailCount >= 3) {
        safeLog('EMAIL_RATE_LIMIT_DB', { ip, email, count: emailCount });
        return {
          allowed: false,
          status: 429,
          reason: 'email_rate_limit',
          message: 'تم تجاوز عدد محاولات الدفع المسموح بها مؤقتًا لهذا البريد الإلكتروني. يرجى المحاولة لاحقًا.'
        };
      }
    } catch (dbErr) {
      // In case of transient DB error checking rate limit, log safely and rely on in-memory guard
      safeLog('RATE_LIMIT_DB_ERROR', { error: dbErr.message });
    }
  }

  return { allowed: true };
}

/**
 * Record payment attempt into both memory and persistent DB
 */
async function recordPaymentAttempt(pool, { ip, email, planId }) {
  const now = Date.now();

  // In-memory update
  const ipTimes = inMemory.ip.get(ip) || [];
  ipTimes.push(now);
  inMemory.ip.set(ip, ipTimes);

  const emailTimes = inMemory.email.get(email) || [];
  emailTimes.push(now);
  inMemory.email.set(email, emailTimes);

  const dupKey = `${email}:${planId}`;
  inMemory.duplicates.set(dupKey, now);

  // Database update
  if (pool) {
    try {
      await pool.query(
        `INSERT INTO payment_attempts(ip_address, email, plan_id)
         VALUES($1, $2, $3)`,
        [ip, email, planId]
      );
    } catch (dbErr) {
      safeLog('RECORD_ATTEMPT_DB_ERROR', { error: dbErr.message });
    }
  }
}

module.exports = {
  getClientIp,
  normalizeEmail,
  checkPaymentRateLimit,
  recordPaymentAttempt,
  safeLog
};
