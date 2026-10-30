'use client'

import Link from 'next/link'
import { Suspense, useState } from 'react'
import { useSearchParams } from 'next/navigation'
import { useForm } from '@tanstack/react-form'
import { AlertCircle, ArrowLeft, KeyRound, Loader2, MailCheck } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { TextField } from '@/components/form/fields'
import { forgotPasswordSchema } from '../schemas/password-schema'
import { requestPasswordReset } from '../services/request-password-reset'

function InvalidLinkNotice() {
  const params = useSearchParams()
  if (params.get('error') !== 'invalid') return null

  return (
    <div className="alert-error">
      <AlertCircle className="h-4 w-4 shrink-0" />
      El enlace no es válido o ya venció. Solicita uno nuevo.
    </div>
  )
}

export default function ForgotPasswordForm() {
  const [sent, setSent] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const form = useForm({
    defaultValues: { email: '' },
    validators: { onSubmit: forgotPasswordSchema },
    onSubmit: async ({ value }) => {
      setError(null)
      const res = await requestPasswordReset(value)
      if (res.error) setError(res.error)
      else setSent(true)
    },
  })

  if (sent) {
    return (
      <>
        <div className="space-y-2">
          <div className="inline-flex rounded-lg bg-emerald-50 p-2.5 text-emerald-600 dark:bg-emerald-500/15 dark:text-emerald-300">
            <MailCheck className="h-5 w-5" />
          </div>
          <h1 className="text-2xl font-bold tracking-tight">Revisa tu correo</h1>
          <p className="muted text-sm">
            Si el correo está registrado, te enviamos un enlace para crear una nueva contraseña.
            Puede tardar unos minutos; revisa también la carpeta de spam. El enlace vence pronto y
            solo sirve una vez.
          </p>
        </div>

        <div className="space-y-3">
          <Button
            type="button"
            variant="outline"
            className="w-full"
            onClick={() => {
              form.reset()
              setSent(false)
            }}
          >
            Usar otro correo
          </Button>
          <Link href="/login" className="muted block text-center text-sm hover:underline">
            Volver al inicio de sesión
          </Link>
        </div>
      </>
    )
  }

  return (
    <>
      <div className="space-y-2">
        <div className="inline-flex rounded-lg bg-indigo-50 p-2.5 text-indigo-600 dark:bg-indigo-500/15 dark:text-indigo-300">
          <KeyRound className="h-5 w-5" />
        </div>
        <h1 className="text-2xl font-bold tracking-tight">¿Olvidaste tu contraseña?</h1>
        <p className="muted text-sm">
          Escribe tu correo institucional y te enviaremos un enlace para crear una nueva.
        </p>
      </div>

      <form
        noValidate
        onSubmit={(e) => {
          e.preventDefault()
          e.stopPropagation()
          form.handleSubmit()
        }}
        className="space-y-4"
      >
        <Suspense fallback={null}>
          <InvalidLinkNotice />
        </Suspense>

        {error && (
          <div className="alert-error">
            <AlertCircle className="h-4 w-4 shrink-0" />
            {error}
          </div>
        )}

        <form.Field name="email">
          {(f) => <TextField field={f} label="Correo institucional" type="email" />}
        </form.Field>

        <form.Subscribe selector={(s) => s.isSubmitting}>
          {(isSubmitting) => (
            <Button type="submit" disabled={isSubmitting} className="w-full">
              {isSubmitting && <Loader2 className="h-4 w-4 animate-spin" />}
              {isSubmitting ? 'Enviando...' : 'Enviar enlace'}
            </Button>
          )}
        </form.Subscribe>
      </form>

      <Link
        href="/login"
        className="muted inline-flex items-center gap-1.5 text-sm hover:underline"
      >
        <ArrowLeft className="h-4 w-4" />
        Volver al inicio de sesión
      </Link>
    </>
  )
}