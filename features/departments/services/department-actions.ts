'use server'

import { revalidatePath } from 'next/cache'
import { z } from 'zod'
import { createAdminClient } from '@/utils/supabase/admin'
import { requireAdmin } from '@/lib/auth/require-admin'
import {
  departmentSchema,
  updateDepartmentSchema,
  type DepartmentValues,
  type UpdateDepartmentValues,
} from '../schemas/department-schema'

type Result = { error?: string; success?: string }

const idSchema = z.string().uuid()
const nullIfEmpty = (v: string) => (v.trim() === '' ? null : v.trim())

function duplicateMessage(error: { code?: string; message: string }) {
  if (error.code !== '23505') return null
  if (error.message.includes('departments_code_key')) {
    return 'Ya existe un departamento con ese código'
  }
  if (error.message.includes('departments_name_key')) {
    return 'Ya existe un departamento con ese nombre'
  }
  return 'Ya existe un departamento con esos datos'
}

export async function createDepartment(values: DepartmentValues): Promise<Result> {
  if (!(await requireAdmin())) return { error: 'No autorizado' }

  const parsed = departmentSchema.safeParse(values)
  if (!parsed.success) return { error: parsed.error.issues[0].message }
  const v = parsed.data

  const admin = createAdminClient()
  const { error } = await admin.from('departments').insert({
    code: v.code,
    name: v.name,
    description: nullIfEmpty(v.description),
  })
  if (error) return { error: duplicateMessage(error) ?? 'No se pudo crear el departamento' }

  revalidatePath('/admin', 'layout')
  return { success: `Departamento ${v.code} creado` }
}

export async function updateDepartment(values: UpdateDepartmentValues): Promise<Result> {
  if (!(await requireAdmin())) return { error: 'No autorizado' }

  const parsed = updateDepartmentSchema.safeParse(values)
  if (!parsed.success) return { error: parsed.error.issues[0].message }
  const v = parsed.data

  const admin = createAdminClient()
  const { data, error } = await admin
    .from('departments')
    .update({ code: v.code, name: v.name, description: nullIfEmpty(v.description) })
    .eq('id', v.id)
    .select('id')
  if (error) return { error: duplicateMessage(error) ?? 'No se pudieron guardar los cambios' }
  if (!data?.length) return { error: 'El departamento ya no existe' }

  revalidatePath('/admin', 'layout')
  return { success: 'Cambios guardados' }
}

export async function setDepartmentActive(id: string, active: boolean): Promise<Result> {
  if (!(await requireAdmin())) return { error: 'No autorizado' }
  if (!idSchema.safeParse(id).success || typeof active !== 'boolean') {
    return { error: 'Datos inválidos' }
  }

  const admin = createAdminClient()
  const { data, error } = await admin
    .from('departments')
    .update({ is_active: active })
    .eq('id', id)
    .select('id')
  if (error) return { error: 'No se pudo actualizar el estado' }
  if (!data?.length) return { error: 'El departamento ya no existe' }

  revalidatePath('/admin', 'layout')
  return { success: active ? 'Departamento reactivado' : 'Departamento desactivado' }
}

export async function deleteDepartment(id: string): Promise<Result> {
  if (!(await requireAdmin())) return { error: 'No autorizado' }
  if (!idSchema.safeParse(id).success) return { error: 'Departamento inválido' }

  const admin = createAdminClient()
  const { data, error } = await admin.from('departments').delete().eq('id', id).select('id')

  if (error) {
    return {
      error:
        error.code === '23503'
          ? 'No se puede eliminar: tiene carreras o cursos asociados. Desactívalo en su lugar.'
          : 'No se pudo eliminar el departamento',
    }
  }
  if (!data?.length) return { error: 'El departamento ya no existe' }

  revalidatePath('/admin', 'layout')
  return { success: 'Departamento eliminado' }
}