import { createClient } from '@supabase/supabase-js';

// Use environment variables if available, otherwise fall back to hardcoded values
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://vsmwvaqhdhacgrlvdqct.supabase.co';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZzbXd2YXFoZGhhY2dybHZkcWN0Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjI3ODAzMTEsImV4cCI6MjA3ODM1NjMxMX0.dRfeXaNQLRaxl27VlvmfmGl8XjP6db8RtZYiQ7Tx94g';

if (!supabaseUrl || !supabaseAnonKey) {
  console.error('Supabase configuration is missing! Please set VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY');
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey);