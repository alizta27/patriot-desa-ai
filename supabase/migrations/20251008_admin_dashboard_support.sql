-- Enable required extension for UUID generation
CREATE EXTENSION IF NOT EXISTS pgcrypto;

-- ================================================
-- 1) App-wide Settings to back Admin Settings page
-- ================================================
CREATE TABLE IF NOT EXISTS public.app_settings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  site_name TEXT NOT NULL DEFAULT 'Patriot Desa',
  maintenance_mode BOOLEAN NOT NULL DEFAULT FALSE,
  max_free_queries INTEGER NOT NULL DEFAULT 5,
  subscription_price INTEGER NOT NULL DEFAULT 99000, -- in IDR
  email_notifications BOOLEAN NOT NULL DEFAULT TRUE,
  auto_backup BOOLEAN NOT NULL DEFAULT TRUE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE public.app_settings ENABLE ROW LEVEL SECURITY;

-- Update updated_at trigger function (created previously) is reused
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_trigger WHERE tgname = 'update_app_settings_updated_at'
  ) THEN
    CREATE TRIGGER update_app_settings_updated_at
    BEFORE UPDATE ON public.app_settings
    FOR EACH ROW
    EXECUTE FUNCTION public.update_updated_at_column();
  END IF;
END $$;

-- Policies: allow admins full access, authenticated can read
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE schemaname = 'public' AND tablename = 'app_settings' AND policyname = 'Admins can manage app_settings'
  ) THEN
    CREATE POLICY "Admins can manage app_settings"
      ON public.app_settings
      FOR ALL
      USING (public.has_role(auth.uid(), 'admin'))
      WITH CHECK (public.has_role(auth.uid(), 'admin'));
  END IF;
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE schemaname = 'public' AND tablename = 'app_settings' AND policyname = 'Authenticated can read app_settings'
  ) THEN
    CREATE POLICY "Authenticated can read app_settings"
      ON public.app_settings
      FOR SELECT
      USING (auth.role() = 'authenticated');
  END IF;
END $$;

-- Seed a single settings row if table is empty
INSERT INTO public.app_settings (site_name, maintenance_mode, max_free_queries, subscription_price, email_notifications, auto_backup)
SELECT 'Patriot Desa', FALSE, 5, 99000, TRUE, TRUE
WHERE NOT EXISTS (SELECT 1 FROM public.app_settings);

-- ==================================================
-- 2) Activity logs to back Admin Activity page
-- ==================================================
-- Enum for activity types
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'activity_type') THEN
    CREATE TYPE public.activity_type AS ENUM ('login', 'query', 'subscription', 'profile_update', 'admin_action');
  END IF;
END $$;

CREATE TABLE IF NOT EXISTS public.activity_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  action TEXT NOT NULL,
  details TEXT,
  type public.activity_type NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE public.activity_logs ENABLE ROW LEVEL SECURITY;

-- Policies: users can insert their own activities; admins can read all
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE schemaname = 'public' AND tablename = 'activity_logs' AND policyname = 'Users can insert own activity_logs'
  ) THEN
    CREATE POLICY "Users can insert own activity_logs"
      ON public.activity_logs
      FOR INSERT
      WITH CHECK (auth.uid() = user_id OR auth.uid() IS NULL);
  END IF;
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE schemaname = 'public' AND tablename = 'activity_logs' AND policyname = 'Admins can read activity_logs'
  ) THEN
    CREATE POLICY "Admins can read activity_logs"
      ON public.activity_logs
      FOR SELECT
      USING (public.has_role(auth.uid(), 'admin'));
  END IF;
END $$;

-- Helpful index for recent queries
CREATE INDEX IF NOT EXISTS idx_activity_logs_created_at ON public.activity_logs(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_activity_logs_user_id ON public.activity_logs(user_id);

-- View including user name for admin UI
CREATE OR REPLACE VIEW public.activity_logs_view AS
SELECT
  l.id,
  l.user_id,
  COALESCE(p.name, u.email) AS user_name,
  l.action,
  l.details,
  l.type,
  l.created_at AS timestamp
FROM public.activity_logs l
LEFT JOIN public.profiles p ON p.id = l.user_id
LEFT JOIN auth.users u ON u.id = l.user_id;

-- ================================================
-- 3) Chat message category to back Query Distribution
-- ================================================
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'message_category') THEN
    CREATE TYPE public.message_category AS ENUM ('administrasi', 'keuangan', 'bumdes', 'lainnya');
  END IF;
END $$;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public' AND table_name = 'chat_messages' AND column_name = 'category'
  ) THEN
    ALTER TABLE public.chat_messages
      ADD COLUMN category public.message_category;
  END IF;
END $$;

-- Optional helper index
CREATE INDEX IF NOT EXISTS idx_chat_messages_category ON public.chat_messages(category);

-- ================================================
-- 4) Ensure profiles contain email for Admin Users list
-- ================================================
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public' AND table_name = 'profiles' AND column_name = 'email'
  ) THEN
    ALTER TABLE public.profiles ADD COLUMN email TEXT;
  END IF;
END $$;

-- Update user creation trigger to also copy email into profiles
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger AS $$
BEGIN
  INSERT INTO public.profiles (
    id,
    name,
    role,
    phone_number,
    subscription_status,
    usage_count,
    daily_usage_reset_at,
    created_at,
    updated_at,
    email
  ) VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'name', NULL),
    NULL,
    NULL,
    'free',
    0,
    NOW(),
    NOW(),
    NOW(),
    NEW.email
  )
  ON CONFLICT (id) DO UPDATE SET
    email = EXCLUDED.email,
    name = COALESCE(EXCLUDED.name, public.profiles.name);

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ==================================================
-- 5) Admin-facing views for dashboard & charts
-- ==================================================
-- Dashboard aggregate stats
CREATE OR REPLACE VIEW public.admin_dashboard_stats AS
WITH role_counts AS (
  SELECT
    COUNT(*) FILTER (WHERE role = 'aparatur') AS aparatur,
    COUNT(*) FILTER (WHERE role = 'pendamping') AS pendamping,
    COUNT(*) FILTER (WHERE role = 'bumdes') AS bumdes,
    COUNT(*) FILTER (WHERE role = 'umum') AS umum,
    COUNT(*) AS total_users,
    COUNT(*) FILTER (WHERE subscription_status = 'premium') AS premium_users
  FROM public.profiles
),
question_counts AS (
  SELECT COUNT(*) AS total_questions
  FROM public.chat_messages
  WHERE role = 'user'
),
revenue AS (
  SELECT COALESCE(SUM(amount_paid), 0)::NUMERIC(12,2) AS total_revenue
  FROM public.subscriptions
)
SELECT
  rc.total_users AS "totalUsers",
  rc.aparatur AS "aparatur",
  rc.pendamping AS "pendamping",
  rc.bumdes AS "bumdes",
  rc.umum AS "umum",
  qc.total_questions AS "totalQuestions",
  rc.premium_users AS "premiumUsers",
  COALESCE(r.total_revenue, 0) AS "totalRevenue"
FROM role_counts rc, question_counts qc, revenue r;

-- Monthly user growth (last 12 months)
CREATE OR REPLACE VIEW public.admin_user_growth AS
SELECT
  to_char(date_trunc('month', created_at), 'Mon') AS month,
  COUNT(*) AS users
FROM public.profiles
WHERE created_at >= (date_trunc('month', NOW()) - INTERVAL '11 months')
GROUP BY 1
ORDER BY MIN(date_trunc('month', created_at));

-- Query distribution by message category (user messages only)
CREATE OR REPLACE VIEW public.admin_query_distribution AS
SELECT
  COALESCE(category::TEXT, 'lainnya') AS category,
  COUNT(*) AS value
FROM public.chat_messages
WHERE role = 'user'
GROUP BY 1
ORDER BY 2 DESC;

-- Note: admin_users view has been deprecated and removed
DROP VIEW IF EXISTS public.admin_users;


