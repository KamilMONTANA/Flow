import { createClient } from '@supabase/supabase-js'

// Create a server-side Supabase client with service role
export const createServerSupabaseClient = () => {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY

  if (!supabaseUrl || !serviceRoleKey) {
    throw new Error('Missing Supabase environment variables')
  }

  return createClient(supabaseUrl, serviceRoleKey, {
    auth: {
      persistSession: false,
    },
  })
}

// Backwards compatibility for existing imports
export const createSupabaseAdminClient = createServerSupabaseClient


