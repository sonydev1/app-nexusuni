'use client'

import { toast } from 'sonner'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import type { RoomRow } from '../types/room-types'
import RoomForm from './room-form'

export default function RoomDialog({
  open,
  onOpenChange,
  room,
  buildings,
}: {
  open: boolean
  onOpenChange: (open: boolean) => void
  room?: RoomRow
  buildings: string[]
}) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[92dvh] overflow-y-auto sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>{room ? `Editar ${room.code}` : 'Nueva aula'}</DialogTitle>
          <DialogDescription>
            {room ? room.name : 'Los horarios de las secciones se asignarán a un aula.'}
          </DialogDescription>
        </DialogHeader>

        {/* Se desmonta al cerrar: el formulario siempre arranca con los datos actuales */}
        <RoomForm
          room={room}
          buildings={buildings}
          onSuccess={(message) => {
            onOpenChange(false)
            toast.success(message)
          }}
        />
      </DialogContent>
    </Dialog>
  )
}