-- LOCAL DEVELOPMENT ONLY. Never run this against the production database.
-- Creates a test admin for http://localhost:3000/admin

-- Local development admin login (test credentials for this app only — never used in production):
--   email: admin@ofp.test   password: ofp-admin-dev
do $$
declare
  v_uid uuid := '44444444-4444-4444-8444-000000000001';
begin
  insert into auth.users (
    instance_id, id, aud, role, email, encrypted_password, email_confirmed_at,
    raw_app_meta_data, raw_user_meta_data, created_at, updated_at,
    confirmation_token, email_change, email_change_token_new, recovery_token
  ) values (
    '00000000-0000-0000-0000-000000000000', v_uid, 'authenticated', 'authenticated',
    'admin@ofp.test', extensions.crypt('ofp-admin-dev', extensions.gen_salt('bf')), now(),
    '{"provider":"email","providers":["email"]}', '{}', now(), now(), '', '', '', ''
  );
  insert into auth.identities (id, user_id, provider_id, identity_data, provider, last_sign_in_at, created_at, updated_at)
  values (gen_random_uuid(), v_uid, v_uid::text,
          jsonb_build_object('sub', v_uid::text, 'email', 'admin@ofp.test', 'email_verified', true),
          'email', now(), now(), now());
  insert into public.admins (user_id) values (v_uid);
end $$;
