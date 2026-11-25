'use server'

import { requireAdmin } from '@/lib/auth/require-admin';
import { rpcErrorMessage } from '@/lib/rpc-errors';
import { createAdminClient } from '@/utils/supabase/admin';
import { revalidatePath } from 'next/cache';
import { z } from 'zod';
import { makeUpdateUserSchema, type UpdateUserValues } from '../schemas/users-schema';
import type { EditUserData } from '../types/user-types';


const idSchema = z.string().uuid()

type ReadResult = { data: EditUserData } | { error: string }
type SaveResult = { error?: string; success?: string }

export async function getUserForEdit(userId: string): Promise<ReadResult> {
  if (!(await requireAdmin())) return { error: 'No autorizado' }
  if (!idSchema.safeParse(userId).success) return { error: 'Usuario inválido' }

  const admin = createAdminClient()

  const [profile, roles, student, teacher, staff, programs] = await Promise.all([
    admin
      .from('profiles')
      .select('full_name, document_type, document_number, phone, birth_date')
      .eq('id', userId)
      .maybeSingle(),
    admin.from('user_roles').select('role').eq('user_id', userId),
    admin.from('students').select('*').eq('user_id', userId).maybeSingle(),
    admin.from('teachers').select('*').eq('user_id', userId).maybeSingle(),
    admin.from('staff').select('*').eq('user_id', userId).maybeSingle(),
    admin.from('programs').select('id, code, name, is_active').order('name'),
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


    student_code: s?.student_code ?? '',
    student_admission_date: s?.admission_date ?? '',
    student_status: s?.status ?? 'active',
    student_program_id: s?.program_id ?? '',

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
    data: { roles: (roles.data ?? []).map((r) => r.role as string), values, programOptions: (programs.data ?? []).map((p) => ({
      id: p.id,
      code: p.code,
      name: p.name,
      isActive: p.is_active,
    })) },
  }
}

export async function updateUser(values: UpdateUserValues): Promise<SaveResult> {
  if (!(await requireAdmin())) return { error: 'No autorizado' }

  const idCheck = idSchema.safeParse(values?.user_id)
  if (!idCheck.success) return { error: 'Usuario inválido' }
  const userId = idCheck.data

  const admin = createAdminClient()

  // Se leen los roles para validar con el esquema correcto. Si cambian antes de
  // guardar, la función de Postgres lo vuelve a comprobar dentro de la transacción.
  const { data: roleRows, error: rolesError } = await admin
    .from('user_roles')
    .select('role')
    .eq('user_id', userId)
  if (rolesError) return { error: 'No se pudieron leer los roles' }
  const roles = (roleRows ?? []).map((r) => r.role as string)

  const parsed = makeUpdateUserSchema(roles).safeParse(values)
  if (!parsed.success) return { error: parsed.error.issues[0].message }

  const { error } = await admin.rpc('admin_update_user', {
    p_user_id: userId,
    p_data: parsed.data,
  })
  if (error) {
    return {
      error: rpcErrorMessage(error, 'No se pudieron guardar los cambios', {
        '23505': 'Ya existe un usuario con ese documento',
      }),
    }
  }

  // Layout completo: el nombre también aparece en la sidebar y el dashboard
  revalidatePath('/', 'layout')
  return { success: 'Cambios guardados' }
}