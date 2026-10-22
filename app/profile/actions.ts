'use server'

import { revalidatePath } from 'next/cache'
import { createClient } from '@/utils/supabase/server'
import { createAdminClient } from '@/utils/supabase/admin'

const MAX_SIZE = 512 * 1024
const EXTENSIONS: Record<string, string> = {
  'image/webp': 'webp',
  'image/jpeg': 'jpg',
  'image/png': 'png',
}

type Result = { error?: string }

// Devuelve el id del usuario objetivo si quien llama tiene permiso
async function resolveTarget(requestedId: string | null) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'No autorizado' as const }

  const targetId = requestedId || user.id
  if (targetId !== user.id) {
    const { data: isAdmin } = await supabase.rpc('has_role', { _role: 'admin' })
    if (!isAdmin) return { error: 'No autorizado' as const }
  }
  return { targetId }
}

export async function updateAvatar(formData: FormData): Promise<Result> {
  const target = await resolveTarget(formData.get('userId') as string | null)
  if ('error' in target) return { error: target.error }

  const file = formData.get('file')
  if (!(file instanceof File)) return { error: 'Archivo inválido' }

  const ext = EXTENSIONS[file.type]
  if (!ext) return { error: 'Formato no permitido (usa JPG, PNG o WebP)' }
  if (file.size > MAX_SIZE) return { error: 'La imagen es demasiado grande' }

  const admin = createAdminClient()

  // Nombre único: sirve también para romper la caché del navegador
  const path = `${target.targetId}/${crypto.randomUUID()}.${ext}`
  const { error: uploadError } = await admin.storage
    .from('avatars')
    .upload(path, file, { contentType: file.type, cacheControl: '31536000' })
  if (uploadError) return { error: 'No se pudo subir la imagen' }

  const { data: old } = await admin
    .from('profiles')
    .select('avatar_path')
    .eq('id', target.targetId)
    .single()

  const { error: dbError } = await admin
    .from('profiles')
    .update({ avatar_path: path })
    .eq('id', target.targetId)

  if (dbError) {
    await admin.storage.from('avatars').remove([path]) // no dejar archivos huérfanos
    return { error: 'No se pudo guardar el avatar' }
  }

  if (old?.avatar_path) await admin.storage.from('avatars').remove([old.avatar_path])

  revalidatePath('/', 'layout')
  return {}
}

export async function removeAvatar(userId?: string): Promise<Result> {
  const target = await resolveTarget(userId ?? null)
  if ('error' in target) return { error: target.error }

  const admin = createAdminClient()
  const { data: old } = await admin
    .from('profiles')
    .select('avatar_path')
    .eq('id', target.targetId)
    .single()

  await admin.from('profiles').update({ avatar_path: null }).eq('id', target.targetId)
  if (old?.avatar_path) await admin.storage.from('avatars').remove([old.avatar_path])

  revalidatePath('/', 'layout')
  return {}
}