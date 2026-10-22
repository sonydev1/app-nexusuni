import type { AnyFieldApi } from '@tanstack/react-form'

export function fieldError(field: AnyFieldApi) {
  const { isTouched, isValid, errors } = field.state.meta
  if (!isTouched || isValid) return null
  return errors
    .map((e) => (typeof e === 'string' ? e : e?.message))
    .filter(Boolean)
    .join(', ')
}

export default function FieldShell({
  field,
  label,
  children,
}: {
  field: AnyFieldApi
  label: string
  children: React.ReactNode
}) {
  const error = fieldError(field)
  return (
    <div className="space-y-1.5">
      <label htmlFor={field.name} className="text-sm font-medium">
        {label}
      </label>
      {children}
      {error && (
        <p className="text-xs text-red-600 dark:text-red-400">{error}</p>
      )}
    </div>
  )
}