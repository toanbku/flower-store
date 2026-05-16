import { createClient, SupabaseClient } from '@supabase/supabase-js'

let _client: SupabaseClient | undefined

function getClient() {
  return (_client ??= createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!,
  ))
}

export const supabase = new Proxy({} as SupabaseClient, {
  get: (_, prop) => (getClient() as any)[prop as string],
})
