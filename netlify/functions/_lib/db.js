const { Pool } = require('pg');

let pool;
let schemaReady = false;

async function ensureSchema(p) {
  if (schemaReady) return;
  const runner = p || pool || db();
  if (!runner) return;

  const statements = [
    `ALTER TABLE students ADD COLUMN IF NOT EXISTS first_name VARCHAR(100);`,
    `ALTER TABLE students ADD COLUMN IF NOT EXISTS last_name VARCHAR(100);`,
    `ALTER TABLE students ADD COLUMN IF NOT EXISTS phone VARCHAR(40);`,
    `ALTER TABLE students ADD COLUMN IF NOT EXISTS country VARCHAR(100);`,
    `ALTER TABLE students ADD COLUMN IF NOT EXISTS profile_completed BOOLEAN NOT NULL DEFAULT FALSE;`,
    `ALTER TABLE students ADD COLUMN IF NOT EXISTS profile_updated_at TIMESTAMP NULL;`,
    `ALTER TABLE students ADD COLUMN IF NOT EXISTS password_hash VARCHAR(255) NULL;`,
    `ALTER TABLE students ADD COLUMN IF NOT EXISTS auth_provider VARCHAR(50) NOT NULL DEFAULT 'email';`,
    `ALTER TABLE students ADD COLUMN IF NOT EXISTS google_id VARCHAR(190) NULL;`,
    `ALTER TABLE students ADD COLUMN IF NOT EXISTS email_verified BOOLEAN NOT NULL DEFAULT FALSE;`,
    `ALTER TABLE students ADD COLUMN IF NOT EXISTS verification_token VARCHAR(120) NULL;`,
    `ALTER TABLE students ADD COLUMN IF NOT EXISTS verification_expires_at TIMESTAMP NULL;`,
    `ALTER TABLE students ADD COLUMN IF NOT EXISTS reset_token VARCHAR(120) NULL;`,
    `ALTER TABLE students ADD COLUMN IF NOT EXISTS reset_expires_at TIMESTAMP NULL;`,
    `ALTER TABLE students ADD COLUMN IF NOT EXISTS last_login_at TIMESTAMP NULL;`,
    `ALTER TABLE students ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP DEFAULT NOW();`,
    `ALTER TABLE students ADD COLUMN IF NOT EXISTS is_blocked BOOLEAN NOT NULL DEFAULT FALSE;`,
    `ALTER TABLE students ADD COLUMN IF NOT EXISTS is_paid BOOLEAN NOT NULL DEFAULT FALSE;`,
    `ALTER TABLE plans ADD COLUMN IF NOT EXISTS price_dzd NUMERIC(10,2) DEFAULT 0;`,
    `ALTER TABLE plans ADD COLUMN IF NOT EXISTS is_featured BOOLEAN DEFAULT FALSE;`,
    `ALTER TABLE exercises ADD COLUMN IF NOT EXISTS access_mode VARCHAR(20) NOT NULL DEFAULT 'paid';`,
    `ALTER TABLE exercises ADD COLUMN IF NOT EXISTS deleted_at TIMESTAMP NULL;`,
    `ALTER TABLE exercises ADD COLUMN IF NOT EXISTS duration_minutes INT DEFAULT NULL;`,
    `CREATE INDEX IF NOT EXISTS idx_students_google_id ON students (google_id) WHERE google_id IS NOT NULL;`,
    `CREATE INDEX IF NOT EXISTS idx_students_verification_token ON students (verification_token) WHERE verification_token IS NOT NULL;`,
    `CREATE INDEX IF NOT EXISTS idx_exercises_access_mode ON exercises(access_mode);`
  ];

  for (const sql of statements) {
    try {
      await runner.query(sql);
    } catch (err) {
      // Individual non-fatal catch allows remaining statements to proceed
    }
  }
  schemaReady = true;
}

function db() {
  if (!pool) {
    pool = new Pool({
      connectionString: process.env.DATABASE_URL,
      ssl: process.env.DATABASE_URL && process.env.DATABASE_URL.includes('localhost')
        ? false
        : { rejectUnauthorized: false },
      max: 5,
      connectionTimeoutMillis: 5000,
      idleTimeoutMillis: 10000,
      statement_timeout: 8000,
      query_timeout: 8000,
    });
    pool.on('error', (err) => {
      console.error('Unexpected error on idle pg client', err);
    });

    // Run ensureSchema once in the background
    ensureSchema(pool).catch(() => {});
  }
  return pool;
}

module.exports = { db, ensureSchema };
