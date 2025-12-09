// Server-side Supabase client for Netlify functions

const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = process.env.VITE_SUPABASE_URL || process.env.SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.warn('Supabase service role key not configured. Key management will not work.');
}

const supabaseAdmin = supabaseUrl && supabaseServiceKey
  ? createClient(supabaseUrl, supabaseServiceKey, {
      auth: {
        autoRefreshToken: false,
        persistSession: false
      }
    })
  : null;

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
      return null;
    }
    throw error;
  }

  return data?.encrypted_api_key || null;
};

const saveUserEncryptedKey = async (userId, encryptedKey) => {
  if (!supabaseAdmin) {
    throw new Error('Supabase admin client not configured');
  }

  const { data: existing } = await supabaseAdmin
    .from('user_preferences')
    .select('id')
    .eq('user_id', userId)
    .single();

  if (existing) {
    const { error } = await supabaseAdmin
      .from('user_preferences')
      .update({ 
        encrypted_api_key: encryptedKey,
        updated_at: new Date().toISOString()
      })
      .eq('user_id', userId);

    if (error) throw error;
  } else {
    const { error } = await supabaseAdmin
      .from('user_preferences')
      .insert({ 
        user_id: userId,
        encrypted_api_key: encryptedKey
      });

    if (error) throw error;
  }
};

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

module.exports = {
  getUserEncryptedKey,
  saveUserEncryptedKey,
  deleteUserEncryptedKey,
  verifyUser,
  isConfigured: () => supabaseAdmin !== null
};

