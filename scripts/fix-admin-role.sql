-- This script checks and fixes admin roles for users

-- 1. Check all users and their profiles
SELECT 
  au.id,
  au.email,
  p.role,
  p.created_at as profile_created
FROM auth.users au
LEFT JOIN profiles p ON au.id = p.id
ORDER BY au.created_at DESC;

-- 2. If you see a user without a profile or with role 'client', update them to admin:
-- Replace 'YOUR_USER_EMAIL@example.com' with your actual email

-- First, check if profile exists
-- If NO profile exists, insert one:
INSERT INTO profiles (id, email, role)
SELECT id, email, 'admin'
FROM auth.users
WHERE email = 'YOUR_EMAIL_HERE'  -- REPLACE THIS
ON CONFLICT (id) DO NOTHING;

-- If profile EXISTS but role is wrong, update it:
UPDATE profiles 
SET role = 'admin'
WHERE id = (SELECT id FROM auth.users WHERE email = 'YOUR_EMAIL_HERE')  -- REPLACE THIS
AND role != 'admin';

-- 3. Verify the fix
SELECT 
  au.id,
  au.email,
  p.role
FROM auth.users au
LEFT JOIN profiles p ON au.id = p.id
WHERE au.email = 'YOUR_EMAIL_HERE';  -- REPLACE THIS

