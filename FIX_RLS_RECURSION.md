# Fix RLS Infinite Recursion Error

## 🔴 Problem

Error: `infinite recursion detected in policy for relation "profiles"`

This happens because the "Admins can view all profiles" RLS policy checks the `profiles` table to see if a user is an admin, which creates infinite recursion.

## ✅ Solution

We need to remove the problematic RLS policy from Supabase.

### Option 1: Using Supabase Dashboard (Recommended)

1. **Go to Supabase Dashboard**
   - Open your project: https://supabase.com/dashboard

2. **Navigate to SQL Editor**
   - Click "SQL Editor" in the left sidebar

3. **Run this SQL**:
   ```sql
   -- Drop the problematic policy
   DROP POLICY IF EXISTS "Admins can view all profiles" ON profiles;
   ```

4. **Click "Run"**

5. **Refresh your app** - The error should be gone!

### Option 2: Using the SQL File

1. **Copy the contents of `fix_rls_policies.sql`**

2. **Go to Supabase Dashboard → SQL Editor**

3. **Paste and run the SQL**

4. **Refresh your app**

## 🎯 What This Does

The fix removes the recursive policy. Now:

- ✅ Users can view their own profile
- ✅ Users can update their own profile
- ❌ Admins cannot view all profiles through RLS (they'll use service role key instead)

## 🔧 For Admin Access

If you need admins to view all profiles, you have 3 options:

### Option A: Use Service Role Key (Recommended)
Admins use the service role key which bypasses RLS entirely. This is already set up in your `createAdminClient()` function.

### Option B: Store Role in JWT Claims
Store the user's role in the JWT token metadata during signup, then check it in the policy:

```sql
CREATE POLICY "Admins can view all profiles" ON profiles
  FOR SELECT 
  USING (
    (auth.jwt() -> 'user_metadata' ->> 'role') IN ('admin', 'staff')
  );
```

### Option C: Separate Admin Table
Create a separate `admin_users` table that doesn't have RLS, and check against that.

## 🧪 Test After Fix

1. **Clear browser cache and cookies**
2. **Restart dev server**:
   ```bash
   npm run dev
   ```
3. **Go to the app**
4. **Login**
5. **Check navbar** - Should show your avatar and name!

## 📝 Why This Happened

The original schema had this policy:

```sql
CREATE POLICY "Admins can view all profiles" ON profiles
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM profiles  -- ❌ This causes recursion!
      WHERE id = auth.uid() AND role IN ('admin', 'staff')
    )
  );
```

When you try to SELECT from `profiles`, it checks the policy, which tries to SELECT from `profiles` again, which checks the policy again... infinite loop!

## ✅ Expected Result

After applying the fix:
- No more "infinite recursion" errors
- Navbar will fetch your profile successfully
- You'll see your avatar and name in the navbar
- Everything will work smoothly!

---

**Status**: 🔧 Ready to Apply
**Priority**: Critical - Blocks all authenticated features
