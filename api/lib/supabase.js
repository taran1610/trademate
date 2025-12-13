// Server-side Supabase client for API routes
// Uses service role key for admin operations (never expose to frontend)

import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.VITE_SUPABASE_URL || process.env.SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.warn('Supabase service role key not configured. Key management will not work.');
}

// Create admin client with service role key (bypasses RLS)
const supabaseAdmin = supabaseUrl && supabaseServiceKey
  ? createClient(supabaseUrl, supabaseServiceKey, {
      auth: {
        autoRefreshToken: false,
        persistSession: false
      }
    })
  : null;

// Get user's encrypted API key from database
const getUserEncryptedKey = async (userId) => {
  if (!supabaseAdmin) {
    throw new Error('Supabase admin client not configured');
  }

  const { data, error } = await supabaseAdmin
    .from('user_preferences')
    .select('encrypted_api_key')
    .eq('user_id', userId)
    .single();

  if (error) {
    if (error.code === 'PGRST116') {
      return null; // No record found
    }
    throw error;
  }

  return data?.encrypted_api_key || null;
};

// Save encrypted API key to database
const saveUserEncryptedKey = async (userId, encryptedKey) => {
  if (!supabaseAdmin) {
    throw new Error('Supabase admin client not configured');
  }

  // Check if preferences exist
  const { data: existing } = await supabaseAdmin
    .from('user_preferences')
    .select('id')
    .eq('user_id', userId)
    .single();

  if (existing) {
    // Update existing
    const { error } = await supabaseAdmin
      .from('user_preferences')
      .update({ 
        encrypted_api_key: encryptedKey,
        updated_at: new Date().toISOString()
      })
      .eq('user_id', userId);

    if (error) throw error;
  } else {
    // Insert new
    const { error } = await supabaseAdmin
      .from('user_preferences')
      .insert({ 
        user_id: userId,
        encrypted_api_key: encryptedKey
      });

    if (error) throw error;
  }
};

// Delete user's encrypted API key
const deleteUserEncryptedKey = async (userId) => {
  if (!supabaseAdmin) {
    throw new Error('Supabase admin client not configured');
  }

  const { error } = await supabaseAdmin
    .from('user_preferences')
    .update({ 
      encrypted_api_key: null,
      updated_at: new Date().toISOString()
    })
    .eq('user_id', userId);

  if (error) throw error;
};

// Verify user exists and get user ID from Supabase auth token
const verifyUser = async (authToken) => {
  if (!supabaseAdmin) {
    throw new Error('Supabase admin client not configured');
  }

  const { data: { user }, error } = await supabaseAdmin.auth.getUser(authToken);
  
  if (error || !user) {
    throw new Error('Invalid or expired authentication token');
  }

  return user.id;
};

export {
  getUserEncryptedKey,
  saveUserEncryptedKey,
  deleteUserEncryptedKey,
  verifyUser
};

export const isConfigured = () => supabaseAdmin !== null;

