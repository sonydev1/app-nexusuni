'use client'

import { useState } from 'react'
import { useForm } from '@tanstack/react-form'
import { AlertCircle, Loader2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import FieldShell from '@/components/form/field-shell'
import { SelectField, TextField } from '@/components/form/fields'
import { ROOM_KIND_OPTIONS } from '../constants'
import { roomSchema, type RoomValues } from '../schemas/room-schema'
import { createRoom, updateRoom } from '../services/room-actions'
import type { RoomRow } from '../types/room-types'

export default function RoomForm({
  room,
  buildings,
  onSuccess,
}: {
  room?: RoomRow
  buildings: string[]
  onSuccess: (message: string) => void
}) {
  const [error, setError] = useState<string | null>(null)

  const defaultValues: RoomValues = {
    code: room?.code ?? '',
    name: room?.name ?? '',
    building: room?.building ?? '',
    kind: room?.kind ?? 'classroom',
    capacity: room ? String(room.capacity) : '',
  }

  const form = useForm({
    defaultValues,
    validators: { onSubmit: roomSchema },
    onSubmit: async ({ value }) => {
      setError(null)
      const res = room ? await updateRoom(room.id, value) : await createRoom(value)

      if (res.error) setError(res.error)
      else onSuccess(res.success ?? 'Guardado')
    },
  })

  return (
    <form
      noValidate
      onSubmit={(e) => {
        e.preventDefault()
        e.stopPropagation()
        form.handleSubmit()
      }}
      className="space-y-4"
    >
      {error && (
        <div className="alert-error">
          <AlertCircle className="h-4 w-4 shrink-0" />
          {error}
        </div>
      )}

      <div className="grid gap-4 sm:grid-cols-[140px_1fr]">
        <form.Field name="code">
          {(f) => <TextField field={f} label="Código" placeholder="Ej: B-201" />}
        </form.Field>
        <form.Field name="name">
          {(f) => <TextField field={f} label="Nombre" placeholder="Ej: Laboratorio de Sistemas 1" />}
        </form.Field>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <form.Field name="building">
          {(f) => (
            <FieldShell field={f} label="Edificio (opcional)">
              <input
                id={f.name}
                name={f.name}
                list="room-buildings"
                value={f.state.value as string}
                onBlur={f.handleBlur}
                onChange={(e) => f.handleChange(e.target.value)}
                placeholder="Ej: Edificio B"
                className="input"
              />
              <datalist id="room-buildings">
                {buildings.map((b) => (
                  <option key={b} value={b} />
                ))}
              </datalist>
            </FieldShell>
          )}
        </form.Field>

        <form.Field name="kind">
          {(f) => <SelectField field={f} label="Tipo" options={ROOM_KIND_OPTIONS} />}
        </form.Field>
      </div>

      <div className="sm:w-1/2 sm:pr-2">
        <form.Field name="capacity">
          {(f) => <TextField field={f} label="Capacidad (personas)" type="number" placeholder="Ej: 30" />}
        </form.Field>
      </div>

      <form.Subscribe selector={(s) => s.isSubmitting}>
        {(isSubmitting) => (
          <Button type="submit" disabled={isSubmitting} className="w-full">
            {isSubmitting && <Loader2 className="h-4 w-4 animate-spin" />}
            {isSubmitting ? 'Guardando...' : room ? 'Guardar cambios' : 'Crear aula'}
          </Button>
        )}
      </form.Subscribe>
    </form>
  )
}