import { createClient, SupabaseClient } from '@supabase/supabase-js'

let _admin: SupabaseClient | undefined

function getAdmin() {
  return (_admin ??= createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
  ))
}

// Server-side only — bypasses RLS. Never expose to client.
export const supabaseAdmin = new Proxy({} as SupabaseClient, {
  get: (_, prop) => (getAdmin() as any)[prop as string],
})
