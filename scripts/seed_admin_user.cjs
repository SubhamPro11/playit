/**
 * One-time script to create/seed the admin user in Supabase Auth.
 * Run with: node scripts/seed_admin_user.cjs
 */
const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

const supabaseUrl = process.env.VITE_SUPABASE_URL || process.env.SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.log('Notice: VITE_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY / VITE_SUPABASE_ANON_KEY not set in environment.');
  console.log('To provision user via script, add credentials to .env or create user in Supabase Dashboard Auth tab:');
  console.log('  Email: morbius@playlist.local');
  console.log('  Password: [provided in setup prompt]');
  process.exit(0);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function seedAdminUser() {
  const email = 'morbius@playlist.local';
  const password = process.env.ADMIN_INITIAL_PASSWORD || 'subhamkr11';

  console.log(`Ensuring admin user (${email}) exists in Supabase Auth...`);

  // Try signing in to see if user already exists
  const { data: signInData, error: signInError } = await supabase.auth.signInWithPassword({
    email,
    password,
  });

  if (signInData?.user) {
    console.log('Admin user already exists and credentials are valid.');
    return;
  }

  // If user doesn't exist, sign up / create user
  const { data: signUpData, error: signUpError } = await supabase.auth.signUp({
    email,
    password,
  });

  if (signUpError) {
    console.error('Failed to provision admin user:', signUpError.message);
  } else {
    console.log('Admin user provisioned successfully:', signUpData.user?.id);
  }
}

seedAdminUser();
