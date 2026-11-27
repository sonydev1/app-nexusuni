'use client'

import { useState } from 'react'
import { Plus } from 'lucide-react'
import { Button } from '@/components/ui/button'
import RoomDialog from './room-dialog'

export default function NewRoomButton({ buildings }: { buildings: string[] }) {
  const [open, setOpen] = useState(false)

  return (
    <>
      <Button onClick={() => setOpen(true)}>
        <Plus className="h-4 w-4" />
        <span className="hidden sm:inline">Nueva aula</span>
        <span className="sm:hidden">Nueva</span>
      </Button>
      <RoomDialog open={open} onOpenChange={setOpen} buildings={buildings} />
    </>
  )
}