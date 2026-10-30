'use server'

import { createClient } from '@/utils/supabase/server'
import { forgotPasswordSchema, type ForgotPasswordValues } from '../schemas/password-schema'

export async function requestPasswordReset(
  values: ForgotPasswordValues
): Promise<{ error?: string }> {
  const parsed = forgotPasswordSchema.safeParse(values)
  if (!parsed.success) return { error: 'Escribe un correo válido' }

  const supabase = await createClient()
  const { error } = await supabase.auth.resetPasswordForEmail(parsed.data.email, {
  redirectTo: `${process.env.NEXT_PUBLIC_SITE_URL}/auth/callback`,
})

  
  if (error) console.error('resetPasswordForEmail:', (error as { code?: string }).code ?? error.status)

  return {}
}