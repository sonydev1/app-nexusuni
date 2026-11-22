'use server'

import { revalidatePath } from 'next/cache'
import { z } from 'zod'
import { createAdminClient } from '@/utils/supabase/admin'
import { requireAdmin } from '@/lib/auth/require-admin'
import { planCourseSchema, type PlanCourseInput } from '../schemas/plan-schema'

type Result = { error?: string; success?: string }

const idSchema = z.string().uuid()

function planError(error: { code?: string; message: string }, fallback: string) {
  if (error.code === '23505') return 'Ese curso ya está en el plan'
  if (error.code === '23503') return 'La carrera o el curso ya no existe'
  // Los errores propios de los triggers (NX...) traen un mensaje listo para mostrar
  if (error.code?.startsWith('NX')) return error.message
  return fallback
}

export async function addCourseToPlan(input: PlanCourseInput): Promise<Result> {
  if (!(await requireAdmin())) return { error: 'No autorizado' }

  const parsed = planCourseSchema.safeParse(input)
  if (!parsed.success) return { error: parsed.error.issues[0].message }
  const v = parsed.data

  const admin = createAdminClient()

  const { data: course } = await admin
    .from('courses')
    .select('is_active')
    .eq('id', v.courseId)
    .maybeSingle()
  if (!course) return { error: 'El curso ya no existe' }
  if (!course.is_active) return { error: 'Solo se pueden agregar cursos activos' }

  const { error } = await admin.from('program_courses').insert({
    program_id: v.programId,
    course_id: v.courseId,
    semester: v.semester,
    kind: v.kind,
  })
  if (error) return { error: planError(error, 'No se pudo agregar el curso al plan') }

  revalidatePath('/admin', 'layout')
  return { success: 'Curso agregado al plan' }
}

export async function updatePlanCourse(input: PlanCourseInput): Promise<Result> {
  if (!(await requireAdmin())) return { error: 'No autorizado' }

  const parsed = planCourseSchema.safeParse(input)
  if (!parsed.success) return { error: parsed.error.issues[0].message }
  const v = parsed.data

  const admin = createAdminClient()
  const { data, error } = await admin
    .from('program_courses')
    .update({ semester: v.semester, kind: v.kind })
    .eq('program_id', v.programId)
    .eq('course_id', v.courseId)
    .select('course_id')
  if (error) return { error: planError(error, 'No se pudieron guardar los cambios') }
  if (!data?.length) return { error: 'El curso ya no está en el plan' }

  revalidatePath('/admin', 'layout')
  return { success: 'Cambios guardados' }
}

export async function removeCourseFromPlan(programId: string, courseId: string): Promise<Result> {
  if (!(await requireAdmin())) return { error: 'No autorizado' }
  if (!idSchema.safeParse(programId).success || !idSchema.safeParse(courseId).success) {
    return { error: 'Datos inválidos' }
  }

  const admin = createAdminClient()
  const { data, error } = await admin
    .from('program_courses')
    .delete()
    .eq('program_id', programId)
    .eq('course_id', courseId)
    .select('course_id')
  if (error) return { error: 'No se pudo quitar el curso del plan' }
  if (!data?.length) return { error: 'El curso ya no está en el plan' }

  revalidatePath('/admin', 'layout')
  return { success: 'Curso quitado del plan' }
}