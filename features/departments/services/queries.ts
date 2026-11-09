import 'server-only'
import { createAdminClient } from '@/utils/supabase/admin'
import { requireAdmin } from '@/lib/auth/require-admin'
import { formatDate } from '@/lib/format-date'
import type { DepartmentRow } from '../types/department-types'

export async function getDepartments(): Promise<DepartmentRow[]> {
  if (!(await requireAdmin())) throw new Error('No autorizado')

  const admin = createAdminClient()
  const { data, error } = await admin
    .from('departments')
    .select('id, code, name, description, is_active, created_at, programs(count)')
    .order('name')

  if (error) throw new Error('No se pudieron cargar los departamentos')

  return (data ?? []).map((d) => ({
    id: d.id,
    code: d.code,
    name: d.name,
    description: d.description ?? '',
    isActive: d.is_active,
    programCount: Array.isArray(d.programs) ? (d.programs[0]?.count ?? 0) : 0,
    createdLabel: formatDate(d.created_at),
  }))
}