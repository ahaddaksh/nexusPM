-- Migration: Create function to sync users from auth.users
-- This allows syncing all users without requiring service role key

CREATE OR REPLACE FUNCTION sync_users_from_auth()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  INSERT INTO users (id, email, "firstName", "lastName", role, "isActive", "createdAt", "updatedAt")
  SELECT 
    id,
    email,
    COALESCE(raw_user_meta_data->>'firstName', split_part(email, '@', 1)),
    COALESCE(raw_user_meta_data->>'lastName', ''),
    COALESCE((raw_user_meta_data->>'role')::text, 'member')::text,
    true,
    created_at,
    NOW()
  FROM auth.users
  ON CONFLICT (id) DO UPDATE SET
    email = EXCLUDED.email,
    "firstName" = EXCLUDED."firstName",
    "lastName" = EXCLUDED."lastName",
    "updatedAt" = NOW();
END;
$$;

-- Grant execute permission to authenticated users
GRANT EXECUTE ON FUNCTION sync_users_from_auth() TO authenticated;

