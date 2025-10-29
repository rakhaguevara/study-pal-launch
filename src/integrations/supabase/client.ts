import { createClient } from '@supabase/supabase-js';
import type { Database } from './types';

// Use provided URL or fallback to the project URL
const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL || 'https://tugqiaqepvaqnnrairax.supabase.co';
const SUPABASE_ANON_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!SUPABASE_ANON_KEY) {
  console.warn('⚠️ VITE_SUPABASE_ANON_KEY is not set. Please add it to your .env file.');
}

// Import the supabase client like this:
// import { supabase } from "@/integrations/supabase/client";

export const supabase = createClient<Database>(SUPABASE_URL, SUPABASE_ANON_KEY || '', {
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