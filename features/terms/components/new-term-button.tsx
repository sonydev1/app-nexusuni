'use client'

import { useState } from 'react'
import { Plus } from 'lucide-react'
import { Button } from '@/components/ui/button'
import TermDialog from './term-dialog'

export default function NewTermButton() {
  const [open, setOpen] = useState(false)

  return (
    <>
      <Button onClick={() => setOpen(true)}>
        <Plus className="h-4 w-4" />
        <span className="hidden sm:inline">Nuevo periodo</span>
        <span className="sm:hidden">Nuevo</span>
      </Button>
      <TermDialog open={open} onOpenChange={setOpen} />
    </>
  )
}