'use server'

import { revalidatePath } from 'next/cache'
import { createClient } from '@/utils/supabase/server'
import { createAdminClient } from '@/utils/supabase/admin'
import { createUserSchema, type CreateUserValues } from '@/lib/schemas'

export type CreateUserResult = { error?: string; success?: string }

const nullIfEmpty = (v: string) => (v.trim() === '' ? null : v.trim())

export async function createUser(values: CreateUserValues): Promise<CreateUserResult> {
  // 1. Solo un admin puede ejecutar esta acción
  const supabase = await createClient()
  const { data: isAdmin } = await supabase.rpc('has_role', { _role: 'admin' })
  if (!isAdmin) return { error: 'No autorizado' }

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

  // 4. Todo lo que sigue es "todo o nada": si algo falla, se borra la cuenta
  //    (las tablas hijas se limpian solas por el on delete cascade)
  const rollback = async (message: string) => {
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

  // 4c. Datos propios del rol
  let roleDataError = null

  if (v.role === 'student') {
    ({ error: roleDataError } = await admin.from('students').insert({
      user_id: userId,
      student_code: v.student_code,
      admission_date: nullIfEmpty(v.admission_date),
    }))
  } else if (v.role === 'teacher') {
    ({ error: roleDataError } = await admin.from('teachers').insert({
      user_id: userId,
      employee_code: v.employee_code,
      specialty: nullIfEmpty(v.specialty),
      academic_degree: nullIfEmpty(v.academic_degree),
      hire_date: nullIfEmpty(v.hire_date),
    }))
  } else if (v.role === 'staff') {
    ({ error: roleDataError } = await admin.from('staff').insert({
      user_id: userId,
      employee_code: v.employee_code,
      position: nullIfEmpty(v.position),
      area: nullIfEmpty(v.area),
      hire_date: nullIfEmpty(v.hire_date),
    }))
  }

  if (roleDataError) {
    return rollback(
      roleDataError.code === '23505'
        ? 'Ya existe una persona con ese código'
        : 'No se pudieron guardar los datos del rol'
    )
  }

  revalidatePath('/admin/users')
  return { success: `Usuario ${v.email} creado correctamente` }
}