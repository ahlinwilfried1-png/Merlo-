import { createClient } from '@supabase/supabase-js';

// Environment variables configuration (Vercel NEXT_PUBLIC_* and Vite VITE_*)
const metaEnv = (typeof import.meta !== 'undefined' && (import.meta as any).env) || {};
const procEnv = (typeof process !== 'undefined' && process.env) || {};

const supabaseUrl: string = 
  procEnv.NEXT_PUBLIC_SUPABASE_URL ||
  metaEnv.VITE_SUPABASE_URL || 
  metaEnv.NEXT_PUBLIC_SUPABASE_URL || 
  'https://vzncyplvarwwhxsfkmhv.supabase.co';

const supabaseAnonKey: string = 
  procEnv.NEXT_PUBLIC_SUPABASE_ANON_KEY ||
  metaEnv.VITE_SUPABASE_ANON_KEY || 
  metaEnv.NEXT_PUBLIC_SUPABASE_ANON_KEY || 
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZ6bmN5cGx2YXJ3d2h4c2ZrbWh2Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODY2ODIwMzIsImV4cCI6MjEwMjI1ODAzMn0.ksipxsHfARgfOkbXBJFbmIfHLfIEKmBARvCJBuY3yaY';

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession: true,
    autoRefreshToken: true
  }
});

// Helper for client-side queries
export const supabaseClientConfig = {
  url: supabaseUrl,
  hasAnonKey: !!supabaseAnonKey
};
