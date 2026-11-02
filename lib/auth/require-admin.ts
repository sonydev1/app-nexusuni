import 'server-only'
import { cache } from 'react'
import { createClient } from '@/utils/supabase/server'

export const requireAdmin = cache(async () => {
  const supabase = await createClient()
  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser()

  if (!user) {
    console.log('[requireAdmin] sin sesión:', userError?.message)
    return null
  }

  const { data: isAdmin, error } = await supabase.rpc('has_role', { _role: 'admin' })
  if (!isAdmin) console.log('[requireAdmin] has_role =', isAdmin, '| error:', error?.message ?? 'ninguno')

  return isAdmin ? user : null
})