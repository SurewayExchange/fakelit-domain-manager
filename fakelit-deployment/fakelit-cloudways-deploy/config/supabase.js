const { createClient } = require('@supabase/supabase-js');

// Supabase configuration
const supabaseUrl = process.env.SUPABASE_URL;
const supabaseAnonKey = process.env.SUPABASE_ANON_KEY;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

// Check if Supabase is configured
const isSupabaseConfigured = supabaseUrl && supabaseAnonKey && supabaseServiceKey;

// Create Supabase client (only if configured)
let supabase = null;
let supabaseAdmin = null;

if (isSupabaseConfigured) {
  try {
    supabase = createClient(supabaseUrl, supabaseAnonKey, {
      auth: {
        autoRefreshToken: true,
        persistSession: true,
        detectSessionInUrl: true
      }
    });

    // Create admin client for server-side operations
    supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey, {
      auth: {
        autoRefreshToken: false,
        persistSession: false
      }
    });
    
    console.log('✅ Supabase client initialized successfully');
  } catch (error) {
    console.error('❌ Failed to initialize Supabase client:', error.message);
    console.log('⚠️ Falling back to in-memory authentication');
  }
} else {
  console.log('⚠️ Supabase not configured - using fallback authentication');
  console.log('   Please set SUPABASE_URL, SUPABASE_ANON_KEY, and SUPABASE_SERVICE_ROLE_KEY in your .env file');
}

// Database tables configuration
const TABLES = {
  USERS: 'users',
  SESSIONS: 'sessions',
  CONVERSATIONS: 'conversations',
  MESSAGES: 'messages',
  COUNSELORS: 'counselors',
  ACHIEVEMENTS: 'achievements',
  ANALYTICS: 'analytics',
  NOTIFICATIONS: 'notifications'
};

// Initialize database tables
const initializeDatabase = async () => {
  if (!isSupabaseConfigured) {
    console.log('⚠️ Supabase not configured - skipping database initialization');
    return;
  }

  try {
    console.log('🔧 Initializing Supabase database...');
    
    // Create users table if it doesn't exist
    const { error: usersError } = await supabaseAdmin
      .from(TABLES.USERS)
      .select('*')
      .limit(1);
    
    if (usersError && usersError.code === 'PGRST116') {
      console.log('📋 Creating users table...');
      // Table doesn't exist, create it via SQL
      const { error } = await supabaseAdmin.rpc('create_users_table');
      if (error) {
        console.log('⚠️ Users table creation failed:', error.message);
      }
    }

    // Create sessions table if it doesn't exist
    const { error: sessionsError } = await supabaseAdmin
      .from(TABLES.SESSIONS)
      .select('*')
      .limit(1);
    
    if (sessionsError && sessionsError.code === 'PGRST116') {
      console.log('📋 Creating sessions table...');
      const { error } = await supabaseAdmin.rpc('create_sessions_table');
      if (error) {
        console.log('⚠️ Sessions table creation failed:', error.message);
      }
    }

    // Create conversations table if it doesn't exist
    const { error: conversationsError } = await supabaseAdmin
      .from(TABLES.CONVERSATIONS)
      .select('*')
      .limit(1);
    
    if (conversationsError && conversationsError.code === 'PGRST116') {
      console.log('📋 Creating conversations table...');
      const { error } = await supabaseAdmin.rpc('create_conversations_table');
      if (error) {
        console.log('⚠️ Conversations table creation failed:', error.message);
      }
    }

    console.log('✅ Database initialization complete');
  } catch (error) {
    console.error('❌ Database initialization failed:', error.message);
  }
};

// User management functions
const userService = {
  // Create a new user
  async createUser(userData) {
    if (!isSupabaseConfigured) {
      // Fallback to in-memory storage
      const { createUser: createUserFallback } = require('../utils/userStorage');
      return createUserFallback(userData);
    }

    const { data, error } = await supabaseAdmin
      .from(TABLES.USERS)
      .insert([userData])
      .select()
      .single();
    
    if (error) throw error;
    return data;
  },

  // Find user by email
  async findUserByEmail(email) {
    if (!isSupabaseConfigured) {
      // Fallback to in-memory storage
      const { findUserByEmail: findUserByEmailFallback } = require('../utils/userStorage');
      return findUserByEmailFallback(email);
    }

    const { data, error } = await supabaseAdmin
      .from(TABLES.USERS)
      .select('*')
      .eq('email', email)
      .single();
    
    if (error && error.code !== 'PGRST116') throw error;
    return data;
  },

  // Find user by ID
  async findUserById(id) {
    if (!isSupabaseConfigured) {
      // Fallback to in-memory storage
      const { findUserById: findUserByIdFallback } = require('../utils/userStorage');
      return findUserByIdFallback(id);
    }

    const { data, error } = await supabaseAdmin
      .from(TABLES.USERS)
      .select('*')
      .eq('id', id)
      .single();
    
    if (error && error.code !== 'PGRST116') throw error;
    return data;
  },

  // Update user
  async updateUser(id, updates) {
    if (!isSupabaseConfigured) {
      // Fallback to in-memory storage
      const { updateUser: updateUserFallback } = require('../utils/userStorage');
      return updateUserFallback(id, updates);
    }

    const { data, error } = await supabaseAdmin
      .from(TABLES.USERS)
      .update(updates)
      .eq('id', id)
      .select()
      .single();
    
    if (error) throw error;
    return data;
  },

  // Delete user
  async deleteUser(id) {
    if (!isSupabaseConfigured) {
      // Fallback to in-memory storage
      const { deleteUser: deleteUserFallback } = require('../utils/userStorage');
      return deleteUserFallback(id);
    }

    const { error } = await supabaseAdmin
      .from(TABLES.USERS)
      .delete()
      .eq('id', id);
    
    if (error) throw error;
    return true;
  }
};

// Session management functions
const sessionService = {
  // Create a new session
  async createSession(sessionData) {
    if (!isSupabaseConfigured) {
      // Fallback to in-memory storage
      return { id: `session_${Date.now()}`, ...sessionData };
    }

    const { data, error } = await supabaseAdmin
      .from(TABLES.SESSIONS)
      .insert([sessionData])
      .select()
      .single();
    
    if (error) throw error;
    return data;
  },

  // Find session by ID
  async findSessionById(id) {
    if (!isSupabaseConfigured) {
      // Fallback to in-memory storage
      return { id, status: 'active' };
    }

    const { data, error } = await supabaseAdmin
      .from(TABLES.SESSIONS)
      .select('*')
      .eq('id', id)
      .single();
    
    if (error && error.code !== 'PGRST116') throw error;
    return data;
  },

  // Update session
  async updateSession(id, updates) {
    if (!isSupabaseConfigured) {
      // Fallback to in-memory storage
      return { id, ...updates };
    }

    const { data, error } = await supabaseAdmin
      .from(TABLES.SESSIONS)
      .update(updates)
      .eq('id', id)
      .select()
      .single();
    
    if (error) throw error;
    return data;
  },

  // Delete session
  async deleteSession(id) {
    if (!isSupabaseConfigured) {
      // Fallback to in-memory storage
      return true;
    }

    const { error } = await supabaseAdmin
      .from(TABLES.SESSIONS)
      .delete()
      .eq('id', id);
    
    if (error) throw error;
    return true;
  }
};

// Conversation management functions
const conversationService = {
  // Create a new conversation
  async createConversation(conversationData) {
    if (!isSupabaseConfigured) {
      // Fallback to in-memory storage
      return { id: `conv_${Date.now()}`, ...conversationData };
    }

    const { data, error } = await supabaseAdmin
      .from(TABLES.CONVERSATIONS)
      .insert([conversationData])
      .select()
      .single();
    
    if (error) throw error;
    return data;
  },

  // Get conversations for a user
  async getUserConversations(userId) {
    if (!isSupabaseConfigured) {
      // Fallback to in-memory storage
      return [];
    }

    const { data, error } = await supabaseAdmin
      .from(TABLES.CONVERSATIONS)
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false });
    
    if (error) throw error;
    return data;
  },

  // Update conversation
  async updateConversation(id, updates) {
    if (!isSupabaseConfigured) {
      // Fallback to in-memory storage
      return { id, ...updates };
    }

    const { data, error } = await supabaseAdmin
      .from(TABLES.CONVERSATIONS)
      .update(updates)
      .eq('id', id)
      .select()
      .single();
    
    if (error) throw error;
    return data;
  }
};

module.exports = {
  supabase,
  supabaseAdmin,
  TABLES,
  initializeDatabase,
  userService,
  sessionService,
  conversationService,
  isSupabaseConfigured
}; 