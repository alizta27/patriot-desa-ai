-- Create pre_registrations table
CREATE TABLE IF NOT EXISTS pre_registrations (
  id SERIAL PRIMARY KEY,
  email VARCHAR(255) UNIQUE NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create index on email for faster lookups
CREATE INDEX IF NOT EXISTS idx_pre_registrations_email ON pre_registrations(email);

-- Add RLS (Row Level Security) policy
ALTER TABLE pre_registrations ENABLE ROW LEVEL SECURITY;

-- Allow anyone to insert (for pre-registration)
CREATE POLICY "Allow public insert on pre_registrations" ON pre_registrations
  FOR INSERT WITH CHECK (true);

-- Only allow authenticated users to read (for admin purposes)
CREATE POLICY "Allow authenticated read on pre_registrations" ON pre_registrations
  FOR SELECT USING (auth.role() = 'authenticated');
