import { createClient } from '@supabase/supabase-js';

const DEFAULT_SUPABASE_URL = 'https://ihnpawujrjxchlvopbwb.supabase.co';
const DEFAULT_SUPABASE_ANON_KEY =
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImlobnBhd3Vqcmp4Y2hsdm9wYndiIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODY3MzY3OTMsImV4cCI6MjEwMjMxMjc5M30.IzgYrSE8Dkh7ub_fDex_ssz1txyLtMt6IzLDX4FlUp0';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || DEFAULT_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || DEFAULT_SUPABASE_ANON_KEY;

export const isSupabaseConfigured = Boolean(supabaseUrl && supabaseAnonKey);

export const supabase = isSupabaseConfigured
  ? createClient(supabaseUrl, supabaseAnonKey)
  : null;
