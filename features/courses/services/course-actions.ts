'use server'

import { revalidatePath } from 'next/cache'
import { z } from 'zod'
import { createAdminClient } from '@/utils/supabase/admin'
import { requireAdmin } from '@/lib/auth/require-admin'
import { rpcErrorMessage } from '@/lib/rpc-errors'
import {
  courseSchema,
  updateCourseSchema,
  type CourseValues,
  type UpdateCourseValues,
} from '../schemas/course-schema'

type Result = { error?: string; success?: string }

const idSchema = z.string().uuid()

function errorMessage(error: { code?: string; message: string }, fallback: string) {
  if (error.code === '23505') {
    if (error.message.includes('courses_code_key')) return 'Ya existe un curso con ese código'
    if (error.message.includes('courses_name_department_key')) {
      return 'Ya existe un curso con ese nombre en el departamento'
    }
    return 'Ya existe un curso con esos datos'
  }
  // Los errores propios de la función (NX...) traen un mensaje listo para mostrar
  return rpcErrorMessage(error, fallback)
}

function toPayload(v: CourseValues) {
  return {
    code: v.code,
    name: v.name,
    department_id: v.department_id,
    credits: Number(v.credits),
    weekly_hours: Number(v.weekly_hours),
    description: v.description,
    prerequisite_ids: v.prerequisite_ids,
  }
}

export async function createCourse(values: CourseValues): Promise<Result> {
  if (!(await requireAdmin())) return { error: 'No autorizado' }

  const parsed = courseSchema.safeParse(values)
  if (!parsed.success) return { error: parsed.error.issues[0].message }
  const v = parsed.data

  const admin = createAdminClient()
  const { error } = await admin.rpc('admin_save_course', { p_id: null, p_data: toPayload(v) })
  if (error) return { error: errorMessage(error, 'No se pudo crear el curso') }

  revalidatePath('/admin', 'layout')
  return { success: `Curso ${v.code} creado` }
}

export async function updateCourse(values: UpdateCourseValues): Promise<Result> {
  if (!(await requireAdmin())) return { error: 'No autorizado' }

  const parsed = updateCourseSchema.safeParse(values)
  if (!parsed.success) return { error: parsed.error.issues[0].message }
  const v = parsed.data

  const admin = createAdminClient()
  const { error } = await admin.rpc('admin_save_course', { p_id: v.id, p_data: toPayload(v) })
  if (error) return { error: errorMessage(error, 'No se pudieron guardar los cambios') }

  revalidatePath('/admin', 'layout')
  return { success: 'Cambios guardados' }
}

export async function setCourseActive(id: string, active: boolean): Promise<Result> {
  if (!(await requireAdmin())) return { error: 'No autorizado' }
  if (!idSchema.safeParse(id).success || typeof active !== 'boolean') {
    return { error: 'Datos inválidos' }
  }

  const admin = createAdminClient()

  // Reactivar un curso en un departamento inactivo dejaría datos incoherentes
  if (active) {
    const { data: course } = await admin
      .from('courses')
      .select('department:departments(is_active)')
      .eq('id', id)
      .maybeSingle()
    if (!course) return { error: 'El curso ya no existe' }

    const dep = Array.isArray(course.department) ? course.department[0] : course.department
    if (!dep?.is_active) {
      return { error: 'El departamento está inactivo. Reactívalo primero.' }
    }
  }

  const { data, error } = await admin
    .from('courses')
    .update({ is_active: active })
    .eq('id', id)
    .select('id')
  if (error) return { error: 'No se pudo actualizar el estado' }
  if (!data?.length) return { error: 'El curso ya no existe' }

  revalidatePath('/admin', 'layout')
  return { success: active ? 'Curso reactivado' : 'Curso desactivado' }
}

export async function deleteCourse(id: string): Promise<Result> {
  if (!(await requireAdmin())) return { error: 'No autorizado' }
  if (!idSchema.safeParse(id).success) return { error: 'Curso inválido' }

  const admin = createAdminClient()
  const { data, error } = await admin.from('courses').delete().eq('id', id).select('id')

  if (error) {
    return {
      error:
        error.code === '23503'
          ? 'No se puede eliminar: es prerrequisito de otros cursos o está en un plan de estudios. Desactívalo en su lugar.'
          : 'No se pudo eliminar el curso',
    }
  }
  if (!data?.length) return { error: 'El curso ya no existe' }

  revalidatePath('/admin', 'layout')
  return { success: 'Curso eliminado' }
}