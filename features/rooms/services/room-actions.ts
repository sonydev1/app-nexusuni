'use server'

import { revalidatePath } from 'next/cache'
import { z } from 'zod'
import { createAdminClient } from '@/utils/supabase/admin'
import { requireAdmin } from '@/lib/auth/require-admin'
import { roomSchema, type RoomValues } from '../schemas/room-schema'

type Result = { error?: string; success?: string }

const idSchema = z.string().uuid()

function toRow(v: RoomValues) {
  return {
    code: v.code,
    name: v.name,
    building: v.building === '' ? null : v.building.replace(/\s+/g, ' '),
    kind: v.kind,
    capacity: Number(v.capacity),
  }
}

function roomError(error: { code?: string; message: string }, fallback: string) {
  if (error.code === '23505') return 'Ya existe un aula con ese código'
  return fallback
}

export async function createRoom(values: RoomValues): Promise<Result> {
  if (!(await requireAdmin())) return { error: 'No autorizado' }

  const parsed = roomSchema.safeParse(values)
  if (!parsed.success) return { error: parsed.error.issues[0].message }

  const admin = createAdminClient()
  const { error } = await admin.from('rooms').insert(toRow(parsed.data))
  if (error) return { error: roomError(error, 'No se pudo crear el aula') }

  revalidatePath('/admin', 'layout')
  return { success: `Aula ${parsed.data.code} creada` }
}

export async function updateRoom(id: string, values: RoomValues): Promise<Result> {
  if (!(await requireAdmin())) return { error: 'No autorizado' }
  if (!idSchema.safeParse(id).success) return { error: 'Aula inválida' }

  const parsed = roomSchema.safeParse(values)
  if (!parsed.success) return { error: parsed.error.issues[0].message }

  const admin = createAdminClient()
  const { data, error } = await admin
    .from('rooms')
    .update(toRow(parsed.data))
    .eq('id', id)
    .select('id')
  if (error) return { error: roomError(error, 'No se pudieron guardar los cambios') }
  if (!data?.length) return { error: 'El aula ya no existe' }

  revalidatePath('/admin', 'layout')
  return { success: 'Cambios guardados' }
}

export async function setRoomActive(id: string, active: boolean): Promise<Result> {
  if (!(await requireAdmin())) return { error: 'No autorizado' }
  if (!idSchema.safeParse(id).success || typeof active !== 'boolean') {
    return { error: 'Datos inválidos' }
  }

  const admin = createAdminClient()
  const { data, error } = await admin
    .from('rooms')
    .update({ is_active: active })
    .eq('id', id)
    .select('id')
  if (error) return { error: 'No se pudo actualizar el estado' }
  if (!data?.length) return { error: 'El aula ya no existe' }

  revalidatePath('/admin', 'layout')
  return { success: active ? 'Aula reactivada' : 'Aula desactivada' }
}

export async function deleteRoom(id: string): Promise<Result> {
  if (!(await requireAdmin())) return { error: 'No autorizado' }
  if (!idSchema.safeParse(id).success) return { error: 'Aula inválida' }

  const admin = createAdminClient()
  const { data, error } = await admin.from('rooms').delete().eq('id', id).select('id')

  if (error) {
    return {
      error:
        error.code === '23503'
          ? 'No se puede eliminar: tiene horarios asignados. Desactívala en su lugar.'
          : 'No se pudo eliminar el aula',
    }
  }
  if (!data?.length) return { error: 'El aula ya no existe' }

  revalidatePath('/admin', 'layout')
  return { success: 'Aula eliminada' }
}