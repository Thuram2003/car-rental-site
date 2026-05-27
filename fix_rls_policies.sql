-- Fix RLS Policies for Profiles Table
-- This fixes the "infinite recursion detected in policy" error

-- Drop existing problematic policies
DROP POLICY IF EXISTS "Users can view own profile" ON profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON profiles;
DROP POLICY IF EXISTS "Admins can view all profiles" ON profiles;

-- Recreate policies without recursion

-- 1. Users can view their own profile
CREATE POLICY "Users can view own profile" ON profiles
  FOR SELECT 
  USING (auth.uid() = id);

-- 2. Users can update their own profile
CREATE POLICY "Users can update own profile" ON profiles
  FOR UPDATE 
  USING (auth.uid() = id);

-- 3. For admin access, we'll use a different approach
-- Option A: Store admin role in auth.users metadata and check that
-- Option B: Use service role key for admin operations (recommended)
-- Option C: Create a separate admin_users table

-- For now, let's use a simpler policy that doesn't cause recursion
-- Admins will need to use service role key for viewing all profiles
-- Or we can add the role to JWT claims

-- If you want admins to view all profiles, uncomment this:
-- But make sure to set the role in auth.users raw_user_meta_data during signup
/*
CREATE POLICY "Admins can view all profiles" ON profiles
  FOR SELECT 
  USING (
    (auth.jwt() -> 'user_metadata' ->> 'role') IN ('admin', 'staff')
  );
*/
