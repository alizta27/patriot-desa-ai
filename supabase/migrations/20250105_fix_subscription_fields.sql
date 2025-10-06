-- Add missing fields to profiles table for subscription functionality
ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS subscription_expiry TIMESTAMPTZ,
ADD COLUMN IF NOT EXISTS last_payment_id TEXT,
ADD COLUMN IF NOT EXISTS payment_token TEXT;
