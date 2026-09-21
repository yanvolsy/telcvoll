-- TELC Voll: OneClick DZ Payments, Resend Emails, Notifications & Campaigns Migration
-- Non-destructive: safe to execute multiple times on Postgres/Supabase

-- 1. Add price_dzd to plans if not exists
ALTER TABLE plans ADD COLUMN IF NOT EXISTS price_dzd NUMERIC(10,2) DEFAULT 0;

-- Update default prices for existing plans (ensure >= 500 DZD for paid plans)
UPDATE plans SET price_dzd = 1500 WHERE plan_key = '15d' AND (price_dzd IS NULL OR price_dzd = 0);
UPDATE plans SET price_dzd = 2500 WHERE plan_key = '30d' AND (price_dzd IS NULL OR price_dzd = 0);
UPDATE plans SET price_dzd = 6000 WHERE plan_key = '90d' AND (price_dzd IS NULL OR price_dzd = 0);

-- 2. Orders and Payments table
CREATE TABLE IF NOT EXISTS orders(
  id BIGSERIAL PRIMARY KEY,
  order_id VARCHAR(80) UNIQUE NOT NULL,
  plan_id INT NOT NULL REFERENCES plans(id),
  plan_name VARCHAR(120) NOT NULL,
  customer_name VARCHAR(160) NOT NULL,
  customer_email VARCHAR(190) NOT NULL,
  customer_phone VARCHAR(40),
  amount NUMERIC(10,2) NOT NULL,
  currency VARCHAR(10) NOT NULL DEFAULT 'DZD',
  payment_provider VARCHAR(50) NOT NULL DEFAULT 'oneclick',
  payment_ref VARCHAR(120) UNIQUE,
  payment_url TEXT,
  status VARCHAR(30) NOT NULL DEFAULT 'PENDING',
  access_code VARCHAR(80),
  code_id BIGINT REFERENCES access_codes(id) ON DELETE SET NULL,
  student_id BIGINT REFERENCES students(id) ON DELETE SET NULL,
  paid_at TIMESTAMP NULL,
  expires_at TIMESTAMP NULL,
  email_sent BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_orders_ref ON orders(payment_ref);
CREATE INDEX IF NOT EXISTS idx_orders_status ON orders(status);
CREATE INDEX IF NOT EXISTS idx_orders_email ON orders(customer_email);
CREATE INDEX IF NOT EXISTS idx_orders_created ON orders(created_at DESC);

-- 3. Admin Announcements / Notifications table
CREATE TABLE IF NOT EXISTS admin_notifications(
  id BIGSERIAL PRIMARY KEY,
  title VARCHAR(255) NOT NULL,
  message TEXT NOT NULL,
  type VARCHAR(50) NOT NULL DEFAULT 'info',
  priority VARCHAR(20) NOT NULL DEFAULT 'normal',
  target_type VARCHAR(50) NOT NULL DEFAULT 'all',
  target_value TEXT,
  channel VARCHAR(30) NOT NULL DEFAULT 'in_app',
  start_at TIMESTAMP DEFAULT NOW(),
  end_at TIMESTAMP NULL,
  is_active BOOLEAN NOT NULL DEFAULT TRUE,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_admin_notif_active ON admin_notifications(is_active, start_at);

-- 4. Notification read tracking per student
CREATE TABLE IF NOT EXISTS admin_notification_reads(
  id BIGSERIAL PRIMARY KEY,
  notification_id BIGINT NOT NULL REFERENCES admin_notifications(id) ON DELETE CASCADE,
  student_id BIGINT NOT NULL REFERENCES students(id) ON DELETE CASCADE,
  read_at TIMESTAMP DEFAULT NOW(),
  UNIQUE(notification_id, student_id)
);
CREATE INDEX IF NOT EXISTS idx_notif_reads_student ON admin_notification_reads(student_id);

-- 5. Email campaigns table
CREATE TABLE IF NOT EXISTS email_campaigns(
  id BIGSERIAL PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  subject VARCHAR(255) NOT NULL,
  html_content TEXT NOT NULL,
  target_type VARCHAR(50) NOT NULL DEFAULT 'all',
  target_value TEXT,
  recipient_count INT NOT NULL DEFAULT 0,
  sent_count INT NOT NULL DEFAULT 0,
  failed_count INT NOT NULL DEFAULT 0,
  status VARCHAR(30) NOT NULL DEFAULT 'DRAFT',
  created_at TIMESTAMP DEFAULT NOW(),
  sent_at TIMESTAMP NULL
);

-- 6. Email campaign recipients log
CREATE TABLE IF NOT EXISTS email_campaign_recipients(
  id BIGSERIAL PRIMARY KEY,
  campaign_id BIGINT NOT NULL REFERENCES email_campaigns(id) ON DELETE CASCADE,
  email VARCHAR(190) NOT NULL,
  student_id BIGINT NULL REFERENCES students(id) ON DELETE SET NULL,
  status VARCHAR(30) NOT NULL DEFAULT 'QUEUED',
  provider_id VARCHAR(120),
  error_message TEXT,
  sent_at TIMESTAMP NULL
);
CREATE INDEX IF NOT EXISTS idx_campaign_recipients_cid ON email_campaign_recipients(campaign_id);
