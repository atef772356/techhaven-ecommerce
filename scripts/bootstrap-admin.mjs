import { createClient } from "@supabase/supabase-js";

const email = "admin@ecommerce.com";
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
const password = process.env.ADMIN_INITIAL_PASSWORD;

if (!supabaseUrl || !serviceRoleKey || !password) {
  throw new Error("NEXT_PUBLIC_SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, and ADMIN_INITIAL_PASSWORD are required");
}

if (password.length < 16) {
  throw new Error("ADMIN_INITIAL_PASSWORD must be at least 16 characters");
}

const supabase = createClient(supabaseUrl, serviceRoleKey, {
  auth: { autoRefreshToken: false, persistSession: false },
});

const { data: users, error: listError } = await supabase.auth.admin.listUsers({
  page: 1,
  perPage: 1000,
});
if (listError) throw listError;

const existing = users.users.find((user) => user.email?.toLowerCase() === email);
let userId = existing?.id;

if (existing) {
  const { error } = await supabase.auth.admin.updateUserById(existing.id, {
    password,
    email_confirm: true,
    user_metadata: { full_name: "Admin User" },
  });
  if (error) throw error;
} else {
  const { data, error } = await supabase.auth.admin.createUser({
    email,
    password,
    email_confirm: true,
    user_metadata: { full_name: "Admin User" },
  });
  if (error) throw error;
  userId = data.user?.id;
}

if (!userId) throw new Error("Admin user was not created");

const { error: profileError } = await supabase.from("profiles").upsert({
  id: userId,
  email,
  full_name: "Admin User",
  role: "ADMIN",
});
if (profileError) throw profileError;

console.log(`Admin account provisioned: ${email}`);
