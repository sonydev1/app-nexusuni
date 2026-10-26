'use server'

import { revalidatePath } from 'next/cache'
import { z } from 'zod'
import { createAdminClient } from '@/utils/supabase/admin'
import { makeUpdateUserSchema, type UpdateUserValues } from '../schemas/users-shema'
import type { EditUserData } from '../types/user-types'
import { requireAdmin } from './require-admin'

const idSchema = z.string().uuid()
const nullIfEmpty = (v: string) => (v.trim() === '' ? null : v.trim())

type ReadResult = { data: EditUserData } | { error: string }
type SaveResult = { error?: string; success?: string }

export async function getUserForEdit(userId: string): Promise<ReadResult> {
  if (!(await requireAdmin())) return { error: 'No autorizado' }
  if (!idSchema.safeParse(userId).success) return { error: 'Usuario inválido' }

  const admin = createAdminClient()

  const [profile, roles, student, teacher, staff] = await Promise.all([
    admin
      .from('profiles')
      .select('full_name, document_type, document_number, phone, birth_date')
      .eq('id', userId)
      .maybeSingle(),
    admin.from('user_roles').select('role').eq('user_id', userId),
    admin.from('students').select('*').eq('user_id', userId).maybeSingle(),
    admin.from('teachers').select('*').eq('user_id', userId).maybeSingle(),
    admin.from('staff').select('*').eq('user_id', userId).maybeSingle(),
  ])

  if (!profile.data) return { error: 'Usuario no encontrado' }

  const p = profile.data
  const s = student.data
  const t = teacher.data
  const st = staff.data

  const values: UpdateUserValues = {
    user_id: userId,
    full_name: p.full_name ?? '',
    document_type: p.document_type ?? 'CC',
    document_number: p.document_number ?? '',
    phone: p.phone ?? '',
    birth_date: p.birth_date ?? '',

    // Los códigos se leen solo para mostrarlos (el formulario los bloquea)
    student_code: s?.student_code ?? '',
    student_admission_date: s?.admission_date ?? '',
    student_status: s?.status ?? 'active',

    teacher_employee_code: t?.employee_code ?? '',
    teacher_specialty: t?.specialty ?? '',
    teacher_academic_degree: t?.academic_degree ?? '',
    teacher_hire_date: t?.hire_date ?? '',

    staff_employee_code: st?.employee_code ?? '',
    staff_position: st?.position ?? '',
    staff_area: st?.area ?? '',
    staff_hire_date: st?.hire_date ?? '',
  }

  return {
    data: { roles: (roles.data ?? []).map((r) => r.role as string), values },
  }
}

export async function updateUser(values: UpdateUserValues): Promise<SaveResult> {
  if (!(await requireAdmin())) return { error: 'No autorizado' }

  const idCheck = idSchema.safeParse(values?.user_id)
  if (!idCheck.success) return { error: 'Usuario inválido' }
  const userId = idCheck.data

  const admin = createAdminClient()

  // Los roles se leen de la base de datos, nunca del cliente
  const { data: roleRows, error: rolesError } = await admin
    .from('user_roles')
    .select('role')
    .eq('user_id', userId)
  if (rolesError) return { error: 'No se pudieron leer los roles' }
  const roles = (roleRows ?? []).map((r) => r.role as string)

  const parsed = makeUpdateUserSchema(roles).safeParse(values)
  if (!parsed.success) return { error: parsed.error.issues[0].message }
  const v = parsed.data

  // 1. Datos comunes
  const { error: profileError } = await admin
    .from('profiles')
    .update({
      full_name: v.full_name,
      document_type: v.document_type,
      document_number: v.document_number,
      phone: nullIfEmpty(v.phone),
      birth_date: nullIfEmpty(v.birth_date),
    })
    .eq('id', userId)

  if (profileError) {
    return {
      error:
        profileError.code === '23505'
          ? 'Ya existe un usuario con ese documento'
          : 'No se pudieron guardar los datos personales',
    }
  }

  // 2. Datos por rol.
  //    El código NO se envía: si la fila existe, conserva el suyo;
  //    si es un usuario antiguo sin fila, la base genera uno.
  const generic = 'No se pudieron guardar los datos del rol'

  if (roles.includes('student')) {
    const { error } = await admin.from('students').upsert({
      user_id: userId,
      admission_date: nullIfEmpty(v.student_admission_date),
      status: v.student_status,
    })
    if (error) return { error: generic }
  }

  if (roles.includes('teacher')) {
    const { error } = await admin.from('teachers').upsert({
      user_id: userId,
      specialty: nullIfEmpty(v.teacher_specialty),
      academic_degree: nullIfEmpty(v.teacher_academic_degree),
      hire_date: nullIfEmpty(v.teacher_hire_date),
    })
    if (error) return { error: generic }
  }

  if (roles.includes('staff')) {
    const { error } = await admin.from('staff').upsert({
      user_id: userId,
      position: nullIfEmpty(v.staff_position),
      area: nullIfEmpty(v.staff_area),
      hire_date: nullIfEmpty(v.staff_hire_date),
    })
    if (error) return { error: generic }
  }

  // Layout completo: el nombre también aparece en la sidebar y el dashboard
  revalidatePath('/', 'layout')
  return { success: 'Cambios guardados' }
}