'use server'

import { redirect } from 'next/navigation'
import { createClient } from '@/utils/supabase/server'
import { loginSchema, type LoginValues } from '@/lib/schemas'

export async function login(values: LoginValues): Promise<{ error: string } | void> {
  const parsed = loginSchema.safeParse(values)
  if (!parsed.success) return { error: 'Datos inválidos' }

  const supabase = await createClient()
  const { error } = await supabase.auth.signInWithPassword(parsed.data)

  if (error) return { error: 'Correo o contraseña incorrectos' }

  redirect('/')
}