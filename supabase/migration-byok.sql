-- Migration: Add encrypted_api_key column to user_preferences
-- Run this in Supabase SQL Editor after running the main schema

-- Add encrypted_api_key column if it doesn't exist
ALTER TABLE user_preferences 
ADD COLUMN IF NOT EXISTS encrypted_api_key TEXT;

-- Add comment for documentation
COMMENT ON COLUMN user_preferences.encrypted_api_key IS 'AES-256-GCM encrypted Anthropic API key. Never stored in plaintext.';

-- Verify the column was added
SELECT column_name, data_type 
FROM information_schema.columns 
WHERE table_name = 'user_preferences' 
AND column_name = 'encrypted_api_key';

