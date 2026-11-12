'use server'

import { revalidatePath } from 'next/cache'
import { z } from 'zod'
import { createAdminClient } from '@/utils/supabase/admin'
import { requireAdmin } from '@/lib/auth/require-admin'
import {
  programSchema,
  updateProgramSchema,
  type ProgramValues,
  type UpdateProgramValues,
} from '../schemas/program-schema'

type Result = { error?: string; success?: string }

const idSchema = z.string().uuid()
const nullIfEmpty = (v: string) => (v.trim() === '' ? null : v.trim())

function dbErrorMessage(error: { code?: string; message: string }) {
  if (error.code === '23505') {
    if (error.message.includes('programs_code_key')) return 'Ya existe una carrera con ese código'
    if (error.message.includes('programs_name_level_key')) {
      return 'Ya existe una carrera con ese nombre y nivel'
    }
    if (error.message.includes('programs_snies_key')) {
      return 'Ya existe una carrera con ese código SNIES'
    }
    return 'Ya existe una carrera con esos datos'
  }
  if (error.code === '23503') return 'El departamento ya no existe'
  return null
}

async function checkDepartment(admin: ReturnType<typeof createAdminClient>, id: string) {
  const { data } = await admin.from('departments').select('is_active').eq('id', id).maybeSingle()
  if (!data) return 'El departamento no existe'
  if (!data.is_active) return 'El departamento está inactivo. Reactívalo o elige otro.'
  return null
}

export async function createProgram(values: ProgramValues): Promise<Result> {
  if (!(await requireAdmin())) return { error: 'No autorizado' }

  const parsed = programSchema.safeParse(values)
  if (!parsed.success) return { error: parsed.error.issues[0].message }
  const v = parsed.data

  const admin = createAdminClient()
  const departmentError = await checkDepartment(admin, v.department_id)
  if (departmentError) return { error: departmentError }

  const { error } = await admin.from('programs').insert({
    code: v.code,
    name: v.name,
    department_id: v.department_id,
    level: v.level,
    duration_semesters: Number(v.duration_semesters),
    total_credits: Number(v.total_credits),
    description: nullIfEmpty(v.description),
    snies_code: nullIfEmpty(v.snies_code),
    modality: v.modality,
  })
  if (error) return { error: dbErrorMessage(error) ?? 'No se pudo crear la carrera' }

  revalidatePath('/admin', 'layout')
  return { success: `Carrera ${v.code} creada` }
}

export async function updateProgram(values: UpdateProgramValues): Promise<Result> {
  if (!(await requireAdmin())) return { error: 'No autorizado' }

  const parsed = updateProgramSchema.safeParse(values)
  if (!parsed.success) return { error: parsed.error.issues[0].message }
  const v = parsed.data

  const admin = createAdminClient()

  const { data: current } = await admin
    .from('programs')
    .select('department_id')
    .eq('id', v.id)
    .maybeSingle()
  if (!current) return { error: 'La carrera ya no existe' }

  if (current.department_id !== v.department_id) {
    const departmentError = await checkDepartment(admin, v.department_id)
    if (departmentError) return { error: departmentError }
  }

  const { error } = await admin
    .from('programs')
    .update({
      code: v.code,
      name: v.name,
      department_id: v.department_id,
      level: v.level,
      duration_semesters: Number(v.duration_semesters),
      total_credits: Number(v.total_credits),
      description: nullIfEmpty(v.description),
    })
    .eq('id', v.id)
  if (error) return { error: dbErrorMessage(error) ?? 'No se pudieron guardar los cambios' }

  revalidatePath('/admin', 'layout')
  return { success: 'Cambios guardados' }
}

export async function setProgramActive(id: string, active: boolean): Promise<Result> {
  if (!(await requireAdmin())) return { error: 'No autorizado' }
  if (!idSchema.safeParse(id).success || typeof active !== 'boolean') {
    return { error: 'Datos inválidos' }
  }

  const admin = createAdminClient()

  if (active) {
    const { data: program } = await admin
      .from('programs')
      .select('department_id')
      .eq('id', id)
      .maybeSingle()
    if (!program) return { error: 'La carrera ya no existe' }
    const departmentError = await checkDepartment(admin, program.department_id)
    if (departmentError) return { error: departmentError }
  }

  const { data, error } = await admin
    .from('programs')
    .update({ is_active: active })
    .eq('id', id)
    .select('id')
  if (error) return { error: 'No se pudo actualizar el estado' }
  if (!data?.length) return { error: 'La carrera ya no existe' }

  revalidatePath('/admin', 'layout')
  return { success: active ? 'Carrera reactivada' : 'Carrera desactivada' }
}

export async function deleteProgram(id: string): Promise<Result> {
  if (!(await requireAdmin())) return { error: 'No autorizado' }
  if (!idSchema.safeParse(id).success) return { error: 'Carrera inválida' }

  const admin = createAdminClient()
  const { data, error } = await admin.from('programs').delete().eq('id', id).select('id')

  if (error) {
    return {
      error:
        error.code === '23503'
          ? 'No se puede eliminar: tiene estudiantes o plan de estudios asociados. Desactívala en su lugar.'
          : 'No se pudo eliminar la carrera',
    }
  }
  if (!data?.length) return { error: 'La carrera ya no existe' }

  revalidatePath('/admin', 'layout')
  return { success: 'Carrera eliminada' }
}