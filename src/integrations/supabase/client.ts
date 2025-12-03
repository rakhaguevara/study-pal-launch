import { createClient } from '@supabase/supabase-js';
import type { Database } from './types';

// Get Supabase configuration from environment variables
const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL;
const SUPABASE_ANON_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY;

// Validate required environment variables
if (!SUPABASE_URL) {
  throw new Error(
    '⚠️ VITE_SUPABASE_URL is not set. Please add it to your .env file.\n' +
    'Example: VITE_SUPABASE_URL=https://your-project.supabase.co'
  );
}

if (!SUPABASE_ANON_KEY) {
  throw new Error(
    '⚠️ VITE_SUPABASE_ANON_KEY is not set. Please add it to your .env file.\n' +
    'Example: VITE_SUPABASE_ANON_KEY=your-anon-key-here'
  );
}

// Create Supabase client
export const supabase = createClient<Database>(SUPABASE_URL, SUPABASE_ANON_KEY, {
  auth: {
    storage: localStorage,
    persistSession: true,
    autoRefreshToken: true,
  },
  // Global error handling
  global: {
    headers: {
      'x-client-info': 'study-pal@1.0.0',
    },
  },
});
