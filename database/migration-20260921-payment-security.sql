-- Migration: Payment Security, Rate Limiting & Abuse Protection
-- Created: 2026-09-21

-- 1. Table to record checkout attempts for IP & Email Rate Limiting
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

-- 2. Add IP address to orders table for audit trails & analytics
ALTER TABLE orders ADD COLUMN IF NOT EXISTS ip_address VARCHAR(45);
CREATE INDEX IF NOT EXISTS idx_orders_ip ON orders(ip_address);
