'use client'

import { useActionState, useState } from 'react'
import { AlertCircle, GraduationCap, Loader2, Lock, Mail } from 'lucide-react'
import ThemeToggle from '@/components/theme-toggle'
import { login } from './actions'
import { useForm } from '@tanstack/react-form'
import { loginSchema } from '@/lib/schemas'
import FieldShell from '@/components/form/field-shell'

export default function LoginPage() {
  const [serverError, setServerError] = useState<string | null>(null)


  const form = useForm({
    defaultValues: { email: '', password: '' },
    validators: { onSubmit: loginSchema },
    onSubmit: async ({ value }) => {
      setServerError(null)
      const res = await login(value)
      if (res?.error) setServerError(res.error)
    },
  })

  return (
    <main className="relative grid min-h-screen lg:grid-cols-2">
      <ThemeToggle className="absolute right-4 top-4 z-10" />

      {/* Panel de marca (solo en pantallas grandes) */}
      <section className="hidden flex-col justify-between bg-gradient-to-br from-indigo-600 via-indigo-700 to-slate-900 p-12 text-white lg:flex">
        <div className="flex items-center gap-2 text-lg font-semibold">
          <GraduationCap className="h-7 w-7" />
         NexusUni
        </div>
        <div className="space-y-4">
          <h2 className="text-4xl font-bold leading-tight">
            Gestiona la vida académica
            <br />
            en un solo lugar.
          </h2>
          <p className="max-w-md text-indigo-100">
            Matrículas, cursos, notas y horarios para estudiantes, docentes y personal administrativo.
          </p>
        </div>
        <p className="text-sm text-indigo-200">© Universidad</p>
      </section>

      {/* Formulario */}
      <section className="flex items-center justify-center p-6">
        <div className="w-full max-w-sm space-y-8">
          <div className="space-y-2">
            <div className="flex items-center gap-2 text-indigo-600 dark:text-indigo-400 lg:hidden">
              <GraduationCap className="h-6 w-6" />
              <span className="font-semibold">NexusUni</span>
            </div>
            <h1 className="text-2xl font-bold tracking-tight">Bienvenido</h1>
            <p className="muted text-sm">Ingresa con tu cuenta institucional para continuar.</p>
          </div>

          <form
            noValidate
            onSubmit={(e) => {
              e.preventDefault()
              e.stopPropagation()
              form.handleSubmit()
            }}
            className="space-y-5"
          >
            {serverError && (
              <div className="alert-error">
                <AlertCircle className="h-4 w-4 shrink-0" />
                {serverError}
              </div>
            )}

            <form.Field name="email">
              {(field) => (
                <FieldShell field={field} label="Correo institucional">
                  <div className="relative">
                    <Mail className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                    <input
                      id={field.name}
                      name={field.name}
                      type="email"
                      autoComplete="email"
                      placeholder="nombre@universidad.edu"
                      value={field.state.value}
                      onBlur={field.handleBlur}
                      onChange={(e) => field.handleChange(e.target.value)}
                      className="input pl-10"
                    />
                  </div>
                </FieldShell>
              )}
            </form.Field>

            <form.Field name="password">
              {(field) => (
                <FieldShell field={field} label="Contraseña">
                  <div className="relative">
                    <Lock className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                    <input
                      id={field.name}
                      name={field.name}
                      type="password"
                      autoComplete="current-password"
                      placeholder="••••••••"
                      value={field.state.value}
                      onBlur={field.handleBlur}
                      onChange={(e) => field.handleChange(e.target.value)}
                      className="input pl-10"
                    />
                  </div>
                </FieldShell>
              )}
            </form.Field>

            <form.Subscribe selector={(s) => s.isSubmitting}>
              {(isSubmitting) => (
                <button disabled={isSubmitting} className="btn-primary">
                  {isSubmitting && <Loader2 className="h-4 w-4 animate-spin" />}
                  {isSubmitting ? 'Entrando...' : 'Entrar'}
                </button>
              )}
            </form.Subscribe>
          </form>

          <p className="text-center text-xs text-slate-400 dark:text-slate-500">
            ¿Sin acceso? Solicita tu cuenta a la oficina de administración.
          </p>
        </div>
      </section>
    </main>
  )
}