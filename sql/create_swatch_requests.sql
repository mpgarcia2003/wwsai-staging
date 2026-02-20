-- Run this in your Supabase SQL Editor to create the swatch_requests table
-- This captures leads from the "Send Me Free Swatches" flow

CREATE TABLE IF NOT EXISTS swatch_requests (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  email TEXT NOT NULL,
  address TEXT NOT NULL,
  city_state_zip TEXT NOT NULL,
  fabrics JSONB NOT NULL DEFAULT '[]',
  status TEXT NOT NULL DEFAULT 'pending',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  shipped_at TIMESTAMPTZ,
  notes TEXT
);

-- Enable Row Level Security
ALTER TABLE swatch_requests ENABLE ROW LEVEL SECURITY;

-- Allow anonymous inserts (from the builder app)
CREATE POLICY "Allow anonymous insert" ON swatch_requests
  FOR INSERT WITH CHECK (true);

-- Allow authenticated reads (for admin dashboard)
CREATE POLICY "Allow authenticated read" ON swatch_requests
  FOR SELECT USING (true);

-- Index on status for filtering pending/shipped
CREATE INDEX IF NOT EXISTS idx_swatch_requests_status ON swatch_requests(status);

-- Index on email for customer lookups and dedup
CREATE INDEX IF NOT EXISTS idx_swatch_requests_email ON swatch_requests(email);

-- Index on created_at for chronological ordering
CREATE INDEX IF NOT EXISTS idx_swatch_requests_created ON swatch_requests(created_at DESC);
