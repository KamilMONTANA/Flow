import { createClient } from '@supabase/supabase-js'

type SupabaseClientOptions = {
  persistSession?: boolean
}

export const createSupabaseAdminClient = () => {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY

  if (!supabaseUrl || !serviceRoleKey) {
    throw new Error('Brak konfiguracji Supabase. Ustaw NEXT_PUBLIC_SUPABASE_URL i SUPABASE_SERVICE_ROLE_KEY w środowisku.')
  }

  const options: SupabaseClientOptions = { persistSession: false }

  return createClient(supabaseUrl, serviceRoleKey, { auth: options })
}


