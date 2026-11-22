import 'server-only'
import { z } from 'zod'
import { createAdminClient } from '@/utils/supabase/admin'
import { requireAdmin } from '@/lib/auth/require-admin'
import type { PlanKind } from '../constants'
import type { PlanCandidate, PlanCourse } from '../types/plan-types'

const idSchema = z.string().uuid()

type RawCourse = {
  code: string
  name: string
  credits: number
  weekly_hours: number
  is_active: boolean
}

export async function getProgramPlan(
  programId: string
): Promise<{ courses: PlanCourse[]; candidates: PlanCandidate[] }> {
  if (!(await requireAdmin())) throw new Error('No autorizado')
  if (!idSchema.safeParse(programId).success) return { courses: [], candidates: [] }

  const admin = createAdminClient()

  const [planRes, activeRes] = await Promise.all([
    admin
      .from('program_courses')
      .select('course_id, semester, kind, course:courses(code, name, credits, weekly_hours, is_active)')
      .eq('program_id', programId),
    admin
      .from('courses')
      .select('id, code, name, credits, department:departments(name)')
      .eq('is_active', true)
      .order('code'),
  ])
  if (planRes.error || activeRes.error) throw new Error('No se pudo cargar el plan de estudios')

  const rows = planRes.data ?? []
  const inPlan = new Set(rows.map((r) => r.course_id as string))

  // Prerrequisitos de los cursos del plan (con el código de cada uno)
  const ids = [...inPlan]
  const links = ids.length
    ? ((await admin
        .from('course_prerequisites')
        .select('course_id, prerequisite_id')
        .in('course_id', ids)).data ?? [])
    : []

  const prerequisiteIds = [...new Set(links.map((l) => l.prerequisite_id as string))]
  const prerequisiteCodes = new Map<string, string>()
  if (prerequisiteIds.length) {
    const { data } = await admin.from('courses').select('id, code').in('id', prerequisiteIds)
    for (const c of data ?? []) prerequisiteCodes.set(c.id, c.code)
  }

  const prerequisitesByCourse = new Map<string, { id: string; code: string }[]>()
  for (const l of links) {
    const code = prerequisiteCodes.get(l.prerequisite_id)
    if (!code) continue
    prerequisitesByCourse.set(l.course_id, [
      ...(prerequisitesByCourse.get(l.course_id) ?? []),
      { id: l.prerequisite_id, code },
    ])
  }

  const courses: PlanCourse[] = rows
    .map((r) => {
      const c = (Array.isArray(r.course) ? r.course[0] : r.course) as RawCourse | null
      if (!c) return null
      return {
        courseId: r.course_id as string,
        code: c.code,
        name: c.name,
        credits: c.credits,
        weeklyHours: c.weekly_hours,
        isActive: c.is_active,
        semester: r.semester as number,
        kind: r.kind as PlanKind,
        prerequisites: (prerequisitesByCourse.get(r.course_id) ?? []).sort((a, b) =>
          a.code.localeCompare(b.code)
        ),
      }
    })
    .filter((c): c is PlanCourse => c !== null)
    .sort((a, b) => a.semester - b.semester || a.code.localeCompare(b.code))

  const candidates: PlanCandidate[] = (activeRes.data ?? [])
    .filter((c) => !inPlan.has(c.id))
    .map((c) => {
      const dep = Array.isArray(c.department) ? c.department[0] : c.department
      return {
        id: c.id,
        code: c.code,
        name: c.name,
        credits: c.credits,
        departmentName: dep?.name ?? '',
      }
    })

  return { courses, candidates }
}