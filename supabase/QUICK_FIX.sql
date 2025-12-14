-- QUICK FIX: Run this if you get "table does not exist" error
-- This creates the table and adds the column in one go

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Create user_preferences table (if it doesn't exist)
CREATE TABLE IF NOT EXISTS user_preferences (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE UNIQUE,
  email TEXT,
  encrypted_api_key TEXT, -- AES-256-GCM encrypted API key
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable Row Level Security
ALTER TABLE user_preferences ENABLE ROW LEVEL SECURITY;

-- Create RLS policies
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE tablename = 'user_preferences' 
    AND policyname = 'Users can view their own preferences'
  ) THEN
    CREATE POLICY "Users can view their own preferences"
      ON user_preferences FOR SELECT
      USING (auth.uid() = user_id);
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE tablename = 'user_preferences' 
    AND policyname = 'Users can insert their own preferences'
  ) THEN
    CREATE POLICY "Users can insert their own preferences"
      ON user_preferences FOR INSERT
      WITH CHECK (auth.uid() = user_id);
  END IF;

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

-- Create index
CREATE INDEX IF NOT EXISTS idx_user_preferences_user_id ON user_preferences(user_id);

-- Verify it worked
SELECT 'Table created successfully!' as status;
SELECT column_name, data_type 
FROM information_schema.columns 
WHERE table_name = 'user_preferences';


