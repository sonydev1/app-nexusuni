'use server'

import { revalidatePath } from 'next/cache'
import { z } from 'zod'
import { createAdminClient } from '@/utils/supabase/admin'
import { addRoleSchema, type AddRoleValues } from '../schemas/users-shema'
import { requireAdmin } from './require-admin'
import { ROLES } from '@/lib/schemas'

type Result = { error?: string; success?: string }

const idSchema = z.string().uuid()
const roleSchema = z.enum(ROLES)
const nullIfEmpty = (v: string) => (v.trim() === '' ? null : v.trim())

export async function addRole(values: AddRoleValues): Promise<Result> {
  if (!(await requireAdmin())) return { error: 'No autorizado' }

  const parsed = addRoleSchema.safeParse(values)
  if (!parsed.success) return { error: parsed.error.issues[0].message }
  const v = parsed.data

  const admin = createAdminClient()

  const { data: current, error: readError } = await admin
    .from('user_roles')
    .select('role')
    .eq('user_id', v.user_id)
  if (readError) return { error: 'No se pudieron leer los roles' }
  if (current?.some((r) => r.role === v.role)) {
    return { error: 'La persona ya tiene ese rol' }
  }

  // 1. Datos propios del rol.
  //    El código NO se envía: si la fila se conservó de antes, el upsert
  //    mantiene el código que ya tenía; si es nueva, la base lo genera.
  let dataError: { code?: string } | null = null
  let code: string | null = null

  if (v.role === 'student') {
    const res = await admin
      .from('students')
      .upsert({
        user_id: v.user_id,
        admission_date: nullIfEmpty(v.student_admission_date),
        status: 'active', // al volver a ser estudiante, queda activo
      })
      .select('student_code')
      .single()
    dataError = res.error
    code = res.data?.student_code ?? null
  } else if (v.role === 'teacher') {
    const res = await admin
      .from('teachers')
      .upsert({
        user_id: v.user_id,
        specialty: nullIfEmpty(v.teacher_specialty),
        academic_degree: nullIfEmpty(v.teacher_academic_degree),
        hire_date: nullIfEmpty(v.teacher_hire_date),
      })
      .select('employee_code')
      .single()
    dataError = res.error
    code = res.data?.employee_code ?? null
  } else if (v.role === 'staff') {
    const res = await admin
      .from('staff')
      .upsert({
        user_id: v.user_id,
        position: nullIfEmpty(v.staff_position),
        area: nullIfEmpty(v.staff_area),
        hire_date: nullIfEmpty(v.staff_hire_date),
      })
      .select('employee_code')
      .single()
    dataError = res.error
    code = res.data?.employee_code ?? null
  }

  if (dataError) {
    return { error: 'No se pudieron guardar los datos del rol' }
  }

  // 2. El rol en sí
  const { error: roleError } = await admin
    .from('user_roles')
    .insert({ user_id: v.user_id, role: v.role })
  if (roleError) return { error: 'No se pudo asignar el rol' }

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