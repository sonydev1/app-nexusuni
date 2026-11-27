import 'server-only'
import { cache } from 'react'
import { createAdminClient } from '@/utils/supabase/admin'
import { requireAdmin } from '@/lib/auth/require-admin'
import { formatDate } from '@/lib/format-date'
import type { RoomKind } from '../constants'
import type { RoomRow } from '../types/room-types'

export const getRooms = cache(async (): Promise<RoomRow[]> => {
  if (!(await requireAdmin())) throw new Error('No autorizado')

  const admin = createAdminClient()
  const { data, error } = await admin
    .from('rooms')
    .select('id, code, name, building, kind, capacity, is_active, created_at')
    .order('code')
  if (error) throw new Error('No se pudieron cargar las aulas')

  return (data ?? []).map((r) => ({
    id: r.id,
    code: r.code,
    name: r.name,
    building: r.building ?? '',
    kind: r.kind as RoomKind,
    capacity: r.capacity,
    isActive: r.is_active,
    createdLabel: formatDate(r.created_at),
  }))
})

// Edificios que ya existen, para sugerirlos y filtrar
export function buildingsOf(rooms: RoomRow[]) {
  return [...new Set(rooms.map((r) => r.building).filter(Boolean))].sort((a, b) =>
    a.localeCompare(b)
  )
}