// Unified Storage API with Supabase + localStorage fallback
import { supabase, isSupabaseConfigured } from './supabase.js'

class UnifiedStorage {
  constructor() {
    this.localStoragePrefix = 'trademate_';
    this.useSupabase = isSupabaseConfigured();
  }

  // ============ SESSION METHODS ============

  async loadSessions(userId = null) {
    if (this.useSupabase && userId) {
      try {
        const { data, error } = await supabase
          .from('sessions')
          .select('*')
          .eq('user_id', userId)
          .order('timestamp', { ascending: false });

        if (error) throw error;

        // Convert database format to app format
        return (data || []).map(this._dbToSession);
      } catch (error) {
        console.error('Error loading sessions from Supabase:', error);
        // Fallback to localStorage
        return this._loadSessionsFromLocal();
      }
    }
    return this._loadSessionsFromLocal();
  }

  async saveSession(session, userId = null) {
    if (this.useSupabase && userId) {
      try {
        const dbSession = this._sessionToDb(session, userId);
        
        // Check if session exists
        const { data: existing } = await supabase
          .from('sessions')
          .select('id')
          .eq('id', session.id)
          .eq('user_id', userId)
          .single();

        if (existing) {
          // Update existing
          const { error } = await supabase
            .from('sessions')
            .update(dbSession)
            .eq('id', session.id)
            .eq('user_id', userId);
          
          if (error) throw error;
        } else {
          // Insert new
          const { error } = await supabase
            .from('sessions')
            .insert(dbSession);
          
          if (error) throw error;
        }

        // Also save to localStorage as backup
        await this._saveSessionToLocal(session);
        return true;
      } catch (error) {
        console.error('Error saving session to Supabase:', error);
        // Fallback to localStorage
        return this._saveSessionToLocal(session);
      }
    }
    return this._saveSessionToLocal(session);
  }

  async deleteSession(sessionId, userId = null) {
    if (this.useSupabase && userId) {
      try {
        const { error } = await supabase
          .from('sessions')
          .delete()
          .eq('id', sessionId)
          .eq('user_id', userId);
        
        if (error) throw error;
      } catch (error) {
        console.error('Error deleting session from Supabase:', error);
      }
    }
    
    // Always delete from localStorage too
    try {
      localStorage.removeItem(this.localStoragePrefix + `session:${sessionId}`);
    } catch (error) {
      console.error('Error deleting session from localStorage:', error);
    }
  }

  async deleteAllSessions(userId = null) {
    if (this.useSupabase && userId) {
      try {
        const { error } = await supabase
          .from('sessions')
          .delete()
          .eq('user_id', userId);
        
        if (error) throw error;
      } catch (error) {
        console.error('Error deleting all sessions from Supabase:', error);
      }
    }
    
    // Clear localStorage
    try {
      const keys = Object.keys(localStorage);
      keys.forEach(key => {
        if (key.startsWith(this.localStoragePrefix + 'session:')) {
          localStorage.removeItem(key);
        }
      });
    } catch (error) {
      console.error('Error clearing localStorage:', error);
    }
  }

  // ============ USER PREFERENCES METHODS ============

  async loadUserEmail(userId = null) {
    if (this.useSupabase && userId) {
      try {
        const { data, error } = await supabase
          .from('user_preferences')
          .select('email')
          .eq('user_id', userId)
          .single();

        if (error && error.code !== 'PGRST116') throw error; // PGRST116 = no rows
        
        if (data) return data.email;
      } catch (error) {
        console.error('Error loading email from Supabase:', error);
      }
    }
    
    // Fallback to localStorage
    try {
      const value = localStorage.getItem(this.localStoragePrefix + 'user:email');
      return value || '';
    } catch (error) {
      return '';
    }
  }

  async saveUserEmail(email, userId = null) {
    if (this.useSupabase && userId) {
      try {
        // Check if preferences exist
        const { data: existing } = await supabase
          .from('user_preferences')
          .select('id')
          .eq('user_id', userId)
          .single();

        if (existing) {
          // Update
          const { error } = await supabase
            .from('user_preferences')
            .update({ email, updated_at: new Date().toISOString() })
            .eq('user_id', userId);
          
          if (error) throw error;
        } else {
          // Insert
          const { error } = await supabase
            .from('user_preferences')
            .insert({ user_id: userId, email });
          
          if (error) throw error;
        }
      } catch (error) {
        console.error('Error saving email to Supabase:', error);
      }
    }
    
    // Always save to localStorage as backup
    try {
      localStorage.setItem(this.localStoragePrefix + 'user:email', email);
    } catch (error) {
      console.error('Error saving email to localStorage:', error);
      throw error;
    }
  }

  // ============ PRIVATE HELPER METHODS ============

  _loadSessionsFromLocal() {
    try {
      const sessions = [];
      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        if (key && key.startsWith(this.localStoragePrefix + 'session:')) {
          try {
            const value = localStorage.getItem(key);
            if (value) {
              sessions.push(JSON.parse(value));
            }
          } catch (e) {
            console.error('Error parsing session from localStorage:', e);
          }
        }
      }
      return sessions.sort((a, b) => (b.timestamp || 0) - (a.timestamp || 0));
    } catch (error) {
      console.error('Error loading sessions from localStorage:', error);
      return [];
    }
  }

  _saveSessionToLocal(session) {
    try {
      localStorage.setItem(
        this.localStoragePrefix + `session:${session.id}`,
        JSON.stringify(session)
      );
      return true;
    } catch (error) {
      console.error('Error saving session to localStorage:', error);
      throw error;
    }
  }

  _sessionToDb(session, userId) {
    return {
      id: session.id,
      user_id: userId,
      timestamp: session.timestamp,
      image_url: session.image || null,
      image_data: session.imageData || null,
      image_type: session.imageType || null,
      analysis: session.analysis,
      bias: session.bias,
      trade_taken: session.tradeTaken,
      trade_reason: session.tradeReason || null,
      trade_outcome: session.tradeOutcome || null,
      decision_timestamp: session.decisionTimestamp || null,
      outcome_timestamp: session.outcomeTimestamp || null,
      notes: session.notes || null
    };
  }

  _dbToSession(dbSession) {
    return {
      id: dbSession.id,
      timestamp: dbSession.timestamp,
      image: dbSession.image_url || dbSession.image_data ? 
        (dbSession.image_url || `data:${dbSession.image_type};base64,${dbSession.image_data}`) : null,
      imageData: dbSession.image_data,
      imageType: dbSession.image_type,
      analysis: dbSession.analysis,
      bias: dbSession.bias,
      tradeTaken: dbSession.trade_taken,
      tradeReason: dbSession.trade_reason || '',
      tradeOutcome: dbSession.trade_outcome,
      decisionTimestamp: dbSession.decision_timestamp,
      outcomeTimestamp: dbSession.outcome_timestamp,
      notes: dbSession.notes || ''
    };
  }
}

// Create singleton instance
const unifiedStorage = new UnifiedStorage();

// Export for use in components
export default unifiedStorage;

// Also export as window.storage for backward compatibility
if (typeof window !== 'undefined') {
  window.storage = unifiedStorage;
}

