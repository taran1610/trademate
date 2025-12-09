-- Fix: Create user_preferences table if it doesn't exist, then add encrypted_api_key column
-- Run this in Supabase SQL Editor

-- Enable UUID extension (if not already enabled)
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Create user_preferences table if it doesn't exist
CREATE TABLE IF NOT EXISTS user_preferences (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE UNIQUE,
  email TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Add encrypted_api_key column if it doesn't exist
ALTER TABLE user_preferences 
ADD COLUMN IF NOT EXISTS encrypted_api_key TEXT;

-- Enable Row Level Security (if not already enabled)
ALTER TABLE user_preferences ENABLE ROW LEVEL SECURITY;

-- Create RLS policies (if they don't exist)
DO $$
BEGIN
  -- Users can view their own preferences
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE tablename = 'user_preferences' 
    AND policyname = 'Users can view their own preferences'
  ) THEN
    CREATE POLICY "Users can view their own preferences"
      ON user_preferences FOR SELECT
      USING (auth.uid() = user_id);
  END IF;

  -- Users can insert their own preferences
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE tablename = 'user_preferences' 
    AND policyname = 'Users can insert their own preferences'
  ) THEN
    CREATE POLICY "Users can insert their own preferences"
      ON user_preferences FOR INSERT
      WITH CHECK (auth.uid() = user_id);
  END IF;

  -- Users can update their own preferences
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE tablename = 'user_preferences' 
    AND policyname = 'Users can update their own preferences'
  ) THEN
    CREATE POLICY "Users can update their own preferences"
      ON user_preferences FOR UPDATE
      USING (auth.uid() = user_id);
  END IF;
END $$;

-- Create index if it doesn't exist
CREATE INDEX IF NOT EXISTS idx_user_preferences_user_id ON user_preferences(user_id);

-- Create trigger function if it doesn't exist
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ language 'plpgsql';

-- Create trigger if it doesn't exist
DROP TRIGGER IF EXISTS update_user_preferences_updated_at ON user_preferences;
CREATE TRIGGER update_user_preferences_updated_at 
  BEFORE UPDATE ON user_preferences
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Verify the column was added
SELECT column_name, data_type 
FROM information_schema.columns 
WHERE table_name = 'user_preferences' 
AND column_name = 'encrypted_api_key';

