'use server'

import { revalidatePath } from 'next/cache'
import { z } from 'zod'
import { createAdminClient } from '@/utils/supabase/admin'
import { requireAdmin } from '@/lib/auth/require-admin'
import { ROLES } from '@/lib/schemas'
import { addRoleSchema, type AddRoleValues } from '../schemas/users-schema'
import { rpcErrorMessage } from './rpc-errors'

type Result = { error?: string; success?: string }

const idSchema = z.string().uuid()
const roleSchema = z.enum(ROLES)

export async function addRole(values: AddRoleValues): Promise<Result> {
  if (!(await requireAdmin())) return { error: 'No autorizado' }

  const parsed = addRoleSchema.safeParse(values)
  if (!parsed.success) return { error: parsed.error.issues[0].message }
  const v = parsed.data

  const admin = createAdminClient()
  const { data: code, error } = await admin.rpc('admin_add_role', {
    p_user_id: v.user_id,
    p_role: v.role,
    p_data: v,
  })
  if (error) return { error: rpcErrorMessage(error, 'No se pudo agregar el rol') }

  revalidatePath('/', 'layout')
  return { success: code ? `Rol agregado. Código: ${code}` : 'Rol agregado' }
}

export async function removeRole(userId: string, role: string): Promise<Result> {
  const caller = await requireAdmin()
  if (!caller) return { error: 'No autorizado' }

  const idCheck = idSchema.safeParse(userId)
  const roleCheck = roleSchema.safeParse(role)
  if (!idCheck.success || !roleCheck.success) return { error: 'Datos inválidos' }

  const admin = createAdminClient()

  const { data: current, error: readError } = await admin
    .from('user_roles')
    .select('role')
    .eq('user_id', userId)
  if (readError) return { error: 'No se pudieron leer los roles' }

  const roles = (current ?? []).map((r) => r.role as string)
  if (!roles.includes(role)) return { error: 'La persona no tiene ese rol' }

  // Regla 1: no dejar a nadie sin roles
  if (roles.length === 1) {
    return { error: 'No se puede quitar el único rol de una persona' }
  }

  if (role === 'admin') {
    // Regla 2: no quitarte tu propio rol de admin
    if (userId === caller.id) {
      return { error: 'No puedes quitarte tu propio rol de administrador' }
    }

    // Regla 3: siempre debe quedar al menos un administrador
    const { count } = await admin
      .from('user_roles')
      .select('*', { count: 'exact', head: true })
      .eq('role', 'admin')
    if ((count ?? 0) <= 1) {
      return { error: 'Debe quedar al menos un administrador' }
    }
  }

  // Solo se borra el rol; los datos de students/teachers/staff se conservan
  const { error } = await admin
    .from('user_roles')
    .delete()
    .eq('user_id', userId)
    .eq('role', role)
  if (error) return { error: 'No se pudo quitar el rol' }

  revalidatePath('/', 'layout')
  return { success: 'Rol quitado' }
}