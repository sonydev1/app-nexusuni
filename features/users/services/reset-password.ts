'use server'

import { randomInt } from 'node:crypto'
import { revalidatePath } from 'next/cache'
import { z } from 'zod'
import { createAdminClient } from '@/utils/supabase/admin'
import { requireAdmin } from '@/lib/auth/require-admin'

export type ResetResult = { error?: string; tempPassword?: string }

const idSchema = z.string().uuid()

// Sin caracteres que se confunden al leerlos (0/O, 1/l/I)
const ALPHABET = 'ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnpqrstuvwxyz23456789'

function generateTempPassword(length = 12) {
  while (true) {
    const value = Array.from({ length }, () => ALPHABET[randomInt(ALPHABET.length)]).join('')
    if (/\d/.test(value) && /[a-z]/.test(value) && /[A-Z]/.test(value)) return value
  }
}

export async function resetUserPassword(userId: string): Promise<ResetResult> {
  const caller = await requireAdmin()
  if (!caller) return { error: 'No autorizado' }
  if (!idSchema.safeParse(userId).success) return { error: 'Usuario inválido' }
  if (userId === caller.id) {
    return { error: 'No puedes restablecer tu propia contraseña desde aquí' }
  }

  const admin = createAdminClient()

  const { data: profile } = await admin
    .from('profiles')
    .select('must_change_password')
    .eq('id', userId)
    .maybeSingle()
  if (!profile) return { error: 'Usuario no encontrado' }

  // 1. Primero se exige el cambio: si algo falla después, lo peor que pasa
  //    es que la persona deba cambiar su contraseña actual.
  const { error: flagError } = await admin
    .from('profiles')
    .update({ must_change_password: true })
    .eq('id', userId)
  if (flagError) return { error: 'No se pudo restablecer la contraseña' }

  // 2. Nueva contraseña temporal
  const tempPassword = generateTempPassword()
  const { error: passwordError } = await admin.auth.admin.updateUserById(userId, {
    password: tempPassword,
  })
  if (passwordError) {
    await admin
      .from('profiles')
      .update({ must_change_password: profile.must_change_password })
      .eq('id', userId)
    return { error: 'No se pudo restablecer la contraseña' }
  }

  revalidatePath('/admin/users')
  return { tempPassword }
}