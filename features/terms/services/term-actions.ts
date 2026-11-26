'use server'

import { revalidatePath } from 'next/cache'
import { z } from 'zod'
import { createAdminClient } from '@/utils/supabase/admin'
import { requireAdmin } from '@/lib/auth/require-admin'
import { rpcErrorMessage } from '@/lib/rpc-errors'
import { termSchema, type TermValues } from '../schemas/term-schema'

type Result = { error?: string; success?: string }

const idSchema = z.string().uuid()

function termError(error: { code?: string; message: string }, fallback: string) {
  if (error.code === '23505') {
    if (error.message.includes('academic_terms_code_key')) {
      return 'Ya existe un periodo con ese código'
    }
    if (error.message.includes('academic_terms_one_current')) {
      return 'Otro administrador cambió el periodo vigente. Inténtalo de nuevo.'
    }
    return 'Ya existe un periodo con esos datos'
  }
  if (error.code === '23P01') return 'Las fechas se cruzan con otro periodo'
  return rpcErrorMessage(error, fallback)
}

// Código del periodo con el que se cruzan las fechas, si lo hay (extremos incluidos)
async function findOverlap(
  admin: ReturnType<typeof createAdminClient>,
  v: TermValues,
  excludeId?: string
) {
  let query = admin
    .from('academic_terms')
    .select('code')
    .lte('start_date', v.end_date)
    .gte('end_date', v.start_date)
  if (excludeId) query = query.neq('id', excludeId)

  const { data } = await query.limit(1)
  return data?.[0]?.code as string | undefined
}

export async function createTerm(values: TermValues): Promise<Result> {
  if (!(await requireAdmin())) return { error: 'No autorizado' }

  const parsed = termSchema.safeParse(values)
  if (!parsed.success) return { error: parsed.error.issues[0].message }
  const v = parsed.data

  const admin = createAdminClient()
  const overlap = await findOverlap(admin, v)
  if (overlap) return { error: `Las fechas se cruzan con el periodo ${overlap}` }

  const { error } = await admin.from('academic_terms').insert(v)
  if (error) return { error: termError(error, 'No se pudo crear el periodo') }

  revalidatePath('/admin', 'layout')
  return { success: `Periodo ${v.code} creado` }
}

export async function updateTerm(id: string, values: TermValues): Promise<Result> {
  if (!(await requireAdmin())) return { error: 'No autorizado' }
  if (!idSchema.safeParse(id).success) return { error: 'Periodo inválido' }

  const parsed = termSchema.safeParse(values)
  if (!parsed.success) return { error: parsed.error.issues[0].message }
  const v = parsed.data

  const admin = createAdminClient()
  const overlap = await findOverlap(admin, v, id)
  if (overlap) return { error: `Las fechas se cruzan con el periodo ${overlap}` }

  const { data, error } = await admin
    .from('academic_terms')
    .update(v)
    .eq('id', id)
    .select('id')
  if (error) return { error: termError(error, 'No se pudieron guardar los cambios') }
  if (!data?.length) return { error: 'El periodo ya no existe' }

  revalidatePath('/admin', 'layout')
  return { success: 'Cambios guardados' }
}

export async function setCurrentTerm(id: string): Promise<Result> {
  if (!(await requireAdmin())) return { error: 'No autorizado' }
  if (!idSchema.safeParse(id).success) return { error: 'Periodo inválido' }

  const admin = createAdminClient()
  const { error } = await admin.rpc('admin_set_current_term', { p_id: id })
  if (error) return { error: termError(error, 'No se pudo cambiar el periodo vigente') }

  revalidatePath('/admin', 'layout')
  return { success: 'Periodo vigente actualizado' }
}

export async function deleteTerm(id: string): Promise<Result> {
  if (!(await requireAdmin())) return { error: 'No autorizado' }
  if (!idSchema.safeParse(id).success) return { error: 'Periodo inválido' }

  const admin = createAdminClient()

  const { data: term } = await admin
    .from('academic_terms')
    .select('is_current')
    .eq('id', id)
    .maybeSingle()
  if (!term) return { error: 'El periodo ya no existe' }
  if (term.is_current) {
    return { error: 'No puedes eliminar el periodo vigente. Marca otro como vigente primero.' }
  }

  const { data, error } = await admin.from('academic_terms').delete().eq('id', id).select('id')
  if (error) {
    return {
      error:
        error.code === '23503'
          ? 'No se puede eliminar: tiene secciones o matrículas asociadas.'
          : 'No se pudo eliminar el periodo',
    }
  }
  if (!data?.length) return { error: 'El periodo ya no existe' }

  revalidatePath('/admin', 'layout')
  return { success: 'Periodo eliminado' }
}