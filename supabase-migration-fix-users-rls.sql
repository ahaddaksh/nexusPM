-- Fix RLS policies for users table to allow users to always read their own record
-- This prevents circular dependency issues when checking admin status

-- Drop existing policies
DROP POLICY IF EXISTS "Users can view active users" ON users;
DROP POLICY IF EXISTS "Admins can manage users" ON users;

-- Users can ALWAYS view their own record (needed for role checking)
CREATE POLICY "Users can view own record" ON users
  FOR SELECT USING (auth.uid() = id);

-- Users can view active users (but not inactive ones unless it's themselves)
CREATE POLICY "Users can view active users" ON users
  FOR SELECT USING (isActive = true);

-- Users can update their own record (for profile updates)
CREATE POLICY "Users can update own record" ON users
  FOR UPDATE USING (auth.uid() = id);

-- Admins can manage all users
CREATE POLICY "Admins can manage users" ON users
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM users
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- Note: The "Users can view own record" policy must come first
-- because it's more specific and will match before the "active users" policy

