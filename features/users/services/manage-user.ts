'use server'

import { revalidatePath } from 'next/cache'
import { z } from 'zod'
import { createAdminClient } from '@/utils/supabase/admin'
import { requireAdmin } from '@/lib/auth/require-admin';

type Result = { error?: string; success?: string }

const reasonSchema = z
  .string()
  .trim()
  .min(5, 'Escribe un motivo (mínimo 5 caracteres)')
  .max(200, 'Máximo 200 caracteres')

const idSchema = z.string().uuid()


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

export async function deactivateUser(userId: string, reason: string): Promise<Result> {
  const caller = await requireAdmin()
  if (!caller) return { error: 'No autorizado' }
  if (!idSchema.safeParse(userId).success) return { error: 'Usuario inválido' }
  if (userId === caller.id) return { error: 'No puedes desactivar tu propia cuenta' }

  const parsedReason = reasonSchema.safeParse(reason)
  if (!parsedReason.success) return { error: parsedReason.error.issues[0].message }

  const admin = createAdminClient()

  // Siempre debe quedar al menos un administrador activo
  const { data: adminRoles } = await admin.from('user_roles').select('user_id').eq('role', 'admin')
  const adminIds = (adminRoles ?? []).map((r) => r.user_id)
  if (adminIds.includes(userId)) {
    const others = adminIds.filter((id) => id !== userId)
    const { count } = others.length
      ? await admin
          .from('profiles')
          .select('*', { count: 'exact', head: true })
          .in('id', others)
          .is('deactivated_at', null)
      : { count: 0 }
    if ((count ?? 0) < 1) return { error: 'Debe quedar al menos un administrador activo' }
  }

  // 1. Bloquea el inicio de sesión
  const { error: banError } = await admin.auth.admin.updateUserById(userId, {
    ban_duration: '876000h',
  })
  if (banError) return { error: 'No se pudo desactivar la cuenta' }

  // 2. Registra quién, cuándo y por qué (esto activa el bloqueo inmediato)
  const { error: profileError } = await admin
    .from('profiles')
    .update({
      deactivated_at: new Date().toISOString(),
      deactivated_by: caller.id,
      deactivation_reason: parsedReason.data,
    })
    .eq('id', userId)

  if (profileError) {
    await admin.auth.admin.updateUserById(userId, { ban_duration: 'none' }) // deshace el paso 1
    return { error: 'No se pudo registrar la desactivación' }
  }

  revalidatePath('/admin/users')
  revalidatePath('/admin')
  return { success: 'Cuenta desactivada' }
}


export async function reactivateUser(userId: string): Promise<Result> {
  const caller = await requireAdmin()
  if (!caller) return { error: 'No autorizado' }
  if (!idSchema.safeParse(userId).success) return { error: 'Usuario inválido' }

  const admin = createAdminClient()

  const { error: banError } = await admin.auth.admin.updateUserById(userId, {
    ban_duration: 'none',
  })
  if (banError) return { error: 'No se pudo reactivar la cuenta' }

  const { error: profileError } = await admin
    .from('profiles')
    .update({ deactivated_at: null, deactivated_by: null, deactivation_reason: null })
    .eq('id', userId)
  if (profileError) return { error: 'No se pudo limpiar el registro de desactivación' }

  revalidatePath('/admin/users')
  revalidatePath('/admin')
  return { success: 'Cuenta reactivada' }
}