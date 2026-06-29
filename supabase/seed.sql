-- Safar DZ — Deployed Database Seed Script
-- Run this script inside the SQL Editor of your Supabase Dashboard to create your admin and default partner accounts.

-- ==========================================
-- 1. CREATE ADMIN USER
-- ==========================================
-- Insert the admin into auth.users (make sure to change 'admin_password_here' to a secure password)
INSERT INTO auth.users (
  instance_id,
  id,
  aud,
  role,
  email,
  encrypted_password,
  email_confirmed_at,
  recovery_sent_at,
  last_sign_in_at,
  raw_app_meta_data,
  raw_user_meta_data,
  created_at,
  updated_at,
  confirmation_token,
  email_change,
  email_change_token_new,
  recovery_token
) VALUES (
  '00000000-0000-0000-0000-000000000000',
  'a1b2c3d4-e5f6-7a8b-9c0d-1e2f3a4b5c6d', -- Fixed UUID for Admin
  'authenticated',
  'authenticated',
  'admin@safardz.com',
  extensions.crypt('admin_password_here', extensions.gen_salt('bf', 10)), -- Bcrypt hashed password
  now(),
  null,
  null,
  '{"provider": "email", "providers": ["email"]}',
  '{"full_name": "Admin Safar"}',
  now(),
  now(),
  '',
  '',
  '',
  ''
) ON CONFLICT (id) DO NOTHING;

-- Insert the matching admin profile in public.profiles
INSERT INTO public.profiles (
  id,
  role,
  full_name,
  created_at,
  updated_at
) VALUES (
  'a1b2c3d4-e5f6-7a8b-9c0d-1e2f3a4b5c6d',
  'admin',
  'Admin Safar',
  now(),
  now()
) ON CONFLICT (id) DO NOTHING;


-- ==========================================
-- 2. CREATE DEFAULT PARTNER (PROVIDER) USER
-- ==========================================
-- Insert default partner into auth.users (make sure to change 'partner_password_here' to a secure password)
INSERT INTO auth.users (
  instance_id,
  id,
  aud,
  role,
  email,
  encrypted_password,
  email_confirmed_at,
  recovery_sent_at,
  last_sign_in_at,
  raw_app_meta_data,
  raw_user_meta_data,
  created_at,
  updated_at,
  confirmation_token,
  email_change,
  email_change_token_new,
  recovery_token
) VALUES (
  '00000000-0000-0000-0000-000000000000',
  'b2c3d4e5-f6a7-8b9c-0d1e-2f3a4b5c6d7e', -- Fixed UUID for Partner
  'authenticated',
  'authenticated',
  'partner@safardz.com',
  extensions.crypt('partner_password_here', extensions.gen_salt('bf', 10)),
  now(),
  null,
  null,
  '{"provider": "email", "providers": ["email"]}',
  '{"full_name": "Partenaire Safar"}',
  now(),
  now(),
  '',
  '',
  '',
  ''
) ON CONFLICT (id) DO NOTHING;

-- Insert the matching provider profile in public.profiles
INSERT INTO public.profiles (
  id,
  role,
  full_name,
  created_at,
  updated_at
) VALUES (
  'b2c3d4e5-f6a7-8b9c-0d1e-2f3a4b5c6d7e',
  'provider',
  'Partenaire Safar',
  now(),
  now()
) ON CONFLICT (id) DO NOTHING;

-- Insert the provider record in public.providers
INSERT INTO public.providers (
  id,
  company_name,
  port_location,
  bio,
  is_active,
  created_at
) VALUES (
  'b2c3d4e5-f6a7-8b9c-0d1e-2f3a4b5c6d7e',
  'Safar Partners',
  'Port de Béjaïa',
  'Partenaire par défaut de la plateforme Safar DZ',
  true,
  now()
) ON CONFLICT (id) DO NOTHING;
