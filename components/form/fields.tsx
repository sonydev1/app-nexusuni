import type { AnyFieldApi } from '@tanstack/react-form'
import FieldShell from './field-shell'

export function TextField({
  field,
  label,
  type = 'text',
  placeholder,
  disabled,
}: {
  field: AnyFieldApi
  label: string
  type?: string
  placeholder?: string
  disabled?: boolean
}) {
  return (
    <FieldShell field={field} label={label}>
      <input
        id={field.name}
        name={field.name}
        type={type}
        placeholder={placeholder}
        value={field.state.value as string}
        onBlur={field.handleBlur}
        onChange={(e) => field.handleChange(e.target.value)}
        disabled={disabled}
        className="input"
      />
    </FieldShell>
  )
}

export function SelectField({
  field,
  label,
  options,
}: {
  field: AnyFieldApi
  label: string
  options: { value: string; label: string }[]
}) {
  return (
    <FieldShell field={field} label={label}>
      <select
        id={field.name}
        name={field.name}
        value={field.state.value as string}
        onBlur={field.handleBlur}
        onChange={(e) => field.handleChange(e.target.value)}
        className="input"
      >
        {options.map((o) => (
          <option key={o.value} value={o.value}>
            {o.label}
          </option>
        ))}
      </select>
    </FieldShell>
  )
}