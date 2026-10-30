'use server'

import { redirect } from 'next/navigation'
import { createClient } from '@/utils/supabase/server'
import { createAdminClient } from '@/utils/supabase/admin'
import { changePasswordSchema, type ChangePasswordValues } from '../schemas/password-schema'

export async function changePassword(
  values: ChangePasswordValues
): Promise<{ error: string } | void> {
  const parsed = changePasswordSchema.safeParse(values)
  if (!parsed.success) return { error: parsed.error.issues[0].message }

  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) return { error: 'Tu sesión expiró. Inicia sesión de nuevo.' }

  // 1. Cambia la contraseña de la sesión actual
  const { error } = await supabase.auth.updateUser({ password: parsed.data.password })
  if (error) {
    const code = (error as { code?: string }).code
    if (code === 'same_password' || /different from the old/i.test(error.message)) {
      return { error: 'La nueva contraseña debe ser distinta de la actual.' }
    }
    if (code === 'reauthentication_needed') {
      return { error: 'Por seguridad, vuelve a iniciar sesión e inténtalo de nuevo.' }
    }
    if (code === 'weak_password') {
      return { error: 'La contraseña es demasiado débil. Usa una más larga.' }
    }
    return { error: 'No se pudo cambiar la contraseña.' }
  }

  // 2. Apaga la bandera (solo el servidor puede escribirla)
  const admin = createAdminClient()
  const { error: flagError } = await admin
    .from('profiles')
    .update({ must_change_password: false })
    .eq('id', user.id)
  if (flagError) {
    return { error: 'La contraseña se cambió, pero no se pudo completar. Inténtalo con otra distinta.' }
  }

  // 3. Cierra cualquier otra sesión abierta de esta cuenta
  await supabase.auth.signOut({ scope: 'others' })

  redirect('/')
}