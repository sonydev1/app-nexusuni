'use client'

import { useRef, useState } from 'react'
import { Camera, Loader2, Trash2 } from 'lucide-react'
import Avatar from '@/components/avatar'
import { resizeToSquare } from '@/lib/resize-image'
import { removeAvatar, updateAvatar } from './actions'

export default function AvatarUploader({
  name,
  path,
}: {
  name: string
  path: string | null
}) {
  const inputRef = useRef<HTMLInputElement>(null)
  const [preview, setPreview] = useState<string | null>(null)
  const [pending, setPending] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function onFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    e.target.value = '' // permite elegir el mismo archivo otra vez
    if (!file) return

    if (!file.type.startsWith('image/')) {
      setError('Selecciona un archivo de imagen')
      return
    }

    setError(null)
    setPending(true)
    try {
      const blob = await resizeToSquare(file)
      const formData = new FormData()
      formData.append('file', blob, 'avatar')

      const res = await updateAvatar(formData)
      if (res.error) setError(res.error)
      else setPreview(URL.createObjectURL(blob))
    } catch {
      setError('No se pudo procesar la imagen')
    } finally {
      setPending(false)
    }
  }

  async function onRemove() {
    setError(null)
    setPending(true)
    const res = await removeAvatar()
    setPending(false)
    if (res.error) setError(res.error)
    else setPreview(null)
  }

  const hasAvatar = !!preview || !!path

  return (
    <div className="flex flex-col items-center gap-3 sm:flex-row sm:gap-5">
      <div className="relative">
        <Avatar name={name} path={path} src={preview} size="lg" />
        {pending && (
          <div className="absolute inset-0 flex items-center justify-center rounded-full bg-slate-900/50">
            <Loader2 className="h-6 w-6 animate-spin text-white" />
          </div>
        )}
      </div>

      <div className="space-y-2 text-center sm:text-left">
        <div className="flex flex-wrap justify-center gap-2 sm:justify-start">
          <button
            type="button"
            disabled={pending}
            onClick={() => inputRef.current?.click()}
            className="inline-flex items-center gap-2 rounded-lg border border-slate-300 px-3 py-2 text-sm font-medium transition hover:bg-slate-50 disabled:opacity-60 dark:border-slate-700 dark:hover:bg-slate-800"
          >
            <Camera className="h-4 w-4" />
            Cambiar foto
          </button>

          {hasAvatar && (
            <button
              type="button"
              disabled={pending}
              onClick={onRemove}
              className="inline-flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium text-red-600 transition hover:bg-red-50 disabled:opacity-60 dark:text-red-400 dark:hover:bg-red-500/10"
            >
              <Trash2 className="h-4 w-4" />
              Quitar
            </button>
          )}
        </div>

        <p className="muted text-xs">JPG, PNG o WebP. Se recorta en cuadrado.</p>
        {error && <p className="text-xs text-red-600 dark:text-red-400">{error}</p>}
      </div>

      <input
        ref={inputRef}
        type="file"
        accept="image/png,image/jpeg,image/webp"
        onChange={onFileChange}
        className="hidden"
      />
    </div>
  )
}