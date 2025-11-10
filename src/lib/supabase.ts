import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://vsmwvaqhdhacgrlvdqct.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZzbXd2YXFoZGhhY2dybHZkcWN0Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjI3ODAzMTEsImV4cCI6MjA3ODM1NjMxMX0.dRfeXaNQLRaxl27VlvmfmGl8XjP6db8RtZYiQ7Tx94g';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);