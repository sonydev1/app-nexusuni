'use server'

import { revalidatePath } from 'next/cache'
import { z } from 'zod'
import { createClient } from '@/utils/supabase/server'
import { createAdminClient } from '@/utils/supabase/admin'

type Result = { error?: string; success?: string }

const idSchema = z.string().uuid()

// Devuelve el usuario admin que llama, o null si no tiene permiso
async function requireAdmin() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) return null

  const { data: isAdmin } = await supabase.rpc('has_role', { _role: 'admin' })
  return isAdmin ? user : null
}

export async function setUserDisabled(userId: string, disabled: boolean): Promise<Result> {
  const caller = await requireAdmin()
  if (!caller) return { error: 'No autorizado' }
  if (!idSchema.safeParse(userId).success) return { error: 'Usuario inválido' }
  if (userId === caller.id) return { error: 'No puedes desactivar tu propia cuenta' }

  const admin = createAdminClient()
  const { error } = await admin.auth.admin.updateUserById(userId, {
    // 'none' levanta el bloqueo; 876000 h son unos 100 años
    ban_duration: disabled ? '876000h' : 'none',
  })
  if (error) return { error: 'No se pudo actualizar la cuenta' }

  revalidatePath('/admin/users')
  return { success: disabled ? 'Cuenta desactivada' : 'Cuenta reactivada' }
}

export async function deleteUserAccount(userId: string): Promise<Result> {
  const caller = await requireAdmin()
  if (!caller) return { error: 'No autorizado' }
  if (!idSchema.safeParse(userId).success) return { error: 'Usuario inválido' }
  if (userId === caller.id) return { error: 'No puedes eliminar tu propia cuenta' }

  const admin = createAdminClient()

  // Borra la cuenta; profiles, user_roles y las tablas por rol se limpian por cascade
  const { error } = await admin.auth.admin.deleteUser(userId)
  if (error) return { error: 'No se pudo eliminar el usuario' }

  // Limpieza del avatar (si falla, la cuenta ya no existe y no es crítico)
  const { data: files } = await admin.storage.from('avatars').list(userId)
  if (files?.length) {
    await admin.storage.from('avatars').remove(files.map((f) => `${userId}/${f.name}`))
  }

  revalidatePath('/admin/users')
  revalidatePath('/admin')
  return { success: 'Usuario eliminado' }
}