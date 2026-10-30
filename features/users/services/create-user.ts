'use server'

import { revalidatePath } from 'next/cache'
import { createAdminClient } from '@/utils/supabase/admin'
import { createUserSchema, type CreateUserValues } from '../schemas/users-schema'
import { requireAdmin } from '@/lib/auth/require-admin';

export type CreateUserResult = { error?: string; success?: string }

const nullIfEmpty = (v: string) => (v.trim() === '' ? null : v.trim())

export async function createUser(values: CreateUserValues): Promise<CreateUserResult> {
  // 1. Solo un admin puede ejecutar esta acción
  if (!(await requireAdmin())) return { error: 'No autorizado' }

  // 2. Validar en el servidor
  const parsed = createUserSchema.safeParse(values)
  if (!parsed.success) return { error: parsed.error.issues[0].message }
  const v = parsed.data

  // 3. Crear la cuenta
  const admin = createAdminClient()
  const { data, error } = await admin.auth.admin.createUser({
    email: v.email,
    password: v.password,
    email_confirm: true,
    user_metadata: { full_name: v.full_name },
    app_metadata: { role: v.role },
  })

  if (error || !data.user) {
    return { error: error?.message ?? 'No se pudo crear el usuario' }
  }
  const userId = data.user.id

  // 4. Todo o nada: si algo falla, se borra la cuenta
  //    (las tablas hijas se limpian solas por el on delete cascade)
  const rollback = async (message: string): Promise<CreateUserResult> => {
    await admin.auth.admin.deleteUser(userId)
    return { error: message }
  }

  // 4a. Datos comunes
  const { error: profileError } = await admin.from('profiles').upsert({
    id: userId,
    full_name: v.full_name,
    document_type: v.document_type,
    document_number: v.document_number,
    phone: nullIfEmpty(v.phone),
    birth_date: nullIfEmpty(v.birth_date),
     must_change_password: true,
  })
  if (profileError) {
    return rollback(
      profileError.code === '23505'
        ? 'Ya existe un usuario con ese documento'
        : 'No se pudieron guardar los datos personales'
    )
  }

  // 4b. Rol real (reemplaza el provisional del trigger)
  await admin.from('user_roles').delete().eq('user_id', userId)
  const { error: roleError } = await admin
    .from('user_roles')
    .insert({ user_id: userId, role: v.role })
  if (roleError) return rollback('No se pudo asignar el rol')

  // 4c. Datos del rol. El código lo genera la base de datos y lo leemos de vuelta.
  let roleDataError: unknown = null
  let code: string | null = null

  if (v.role === 'student') {
    const res = await admin
      .from('students')
      .insert({ user_id: userId, admission_date: nullIfEmpty(v.admission_date) })
      .select('student_code')
      .single()
    roleDataError = res.error
    code = res.data?.student_code ?? null
  } else if (v.role === 'teacher') {
    const res = await admin
      .from('teachers')
      .insert({
        user_id: userId,
        specialty: nullIfEmpty(v.specialty),
        academic_degree: nullIfEmpty(v.academic_degree),
        hire_date: nullIfEmpty(v.hire_date),
      })
      .select('employee_code')
      .single()
    roleDataError = res.error
    code = res.data?.employee_code ?? null
  } else if (v.role === 'staff') {
    const res = await admin
      .from('staff')
      .insert({
        user_id: userId,
        position: nullIfEmpty(v.position),
        area: nullIfEmpty(v.area),
        hire_date: nullIfEmpty(v.hire_date),
      })
      .select('employee_code')
      .single()
    roleDataError = res.error
    code = res.data?.employee_code ?? null
  }

  if (roleDataError) return rollback('No se pudieron guardar los datos del rol')

  revalidatePath('/admin/users')
  return {
    success: code
      ? `Usuario ${v.email} creado. Código: ${code}`
      : `Usuario ${v.email} creado correctamente`,
  }
}