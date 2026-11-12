import 'server-only'
import { cache } from 'react'
import { z } from 'zod'
import { createAdminClient } from '@/utils/supabase/admin'
import { requireAdmin } from '@/lib/auth/require-admin'
import { formatDate } from '@/lib/format-date'
import type { ProgramLevel, ProgramModality } from '../constants'
import type { DepartmentOption, ProgramDetail } from '../types/program-types'

const idSchema = z.string().uuid()

const PROGRAM_SELECT =
  'id, code, snies_code, name, department_id, level, modality, duration_semesters, ' +
  'total_credits, description, is_active, created_at, ' +
  'department:departments(code, name, is_active)'

type RawDepartment = { code: string; name: string; is_active: boolean }
type RawProgram = {
  id: string
  code: string
  name: string
  department_id: string
  level: string
  duration_semesters: number
  total_credits: number
  description: string | null
  is_active: boolean
  created_at: string
  snies_code: string | null
  modality: string | null
  department: RawDepartment | RawDepartment[] | null
}

function toProgram(p: RawProgram): ProgramDetail {

  const dep = Array.isArray(p.department) ? p.department[0] : p.department
  return {
    id: p.id,
    code: p.code,
    name: p.name,
    departmentId: p.department_id,
    departmentName: dep?.name ?? '—',
    departmentCode: dep?.code ?? '',
    departmentActive: dep?.is_active ?? false,
    level: p.level as ProgramLevel,
    durationSemesters: p.duration_semesters,
    totalCredits: p.total_credits,
    description: p.description ?? '',
    isActive: p.is_active,
    createdLabel: formatDate(p.created_at),
    sniesCode: p.snies_code ?? '',
    modality: p.modality as ProgramModality ,
  }
}

export const getDepartmentOptions = cache(async (): Promise<DepartmentOption[]> => {
  if (!(await requireAdmin())) throw new Error('No autorizado')

  const admin = createAdminClient()
  const { data, error } = await admin
    .from('departments')
    .select('id, code, name, is_active')
    .order('name')
  if (error) throw new Error('No se pudieron cargar los departamentos')

  return (data ?? []).map((d) => ({
    id: d.id,
    code: d.code,
    name: d.name,
    isActive: d.is_active,
  }))
})

export async function getPrograms(): Promise<ProgramDetail[]> {
  if (!(await requireAdmin())) throw new Error('No autorizado')

  const admin = createAdminClient()
  const { data, error } = await admin.from('programs').select(PROGRAM_SELECT).order('name')
  if (error) throw new Error('No se pudieron cargar las carreras')

  return (data ?? []).map((p) => toProgram(p as unknown as RawProgram))
}

export async function getProgramDetail(id: string): Promise<ProgramDetail | null> {
  if (!(await requireAdmin())) throw new Error('No autorizado')
  if (!idSchema.safeParse(id).success) return null

  const admin = createAdminClient()
  const { data, error } = await admin
    .from('programs')
    .select(PROGRAM_SELECT)
    .eq('id', id)
    .maybeSingle()
  if (error) throw new Error('No se pudo cargar la carrera')

  return data ? toProgram(data as unknown as RawProgram) : null
}