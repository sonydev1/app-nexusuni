'use client'

import { useState } from 'react'
import { Plus } from 'lucide-react'
import { Button } from '@/components/ui/button'
import DepartmentDialog from './department-dialog'

export default function NewDepartmentButton() {
  const [open, setOpen] = useState(false)

  return (
    <>
      <Button onClick={() => setOpen(true)}>
        <Plus className="h-4 w-4" />
        <span className="hidden sm:inline">Nuevo departamento</span>
        <span className="sm:hidden">Nuevo</span>
      </Button>
      <DepartmentDialog open={open} onOpenChange={setOpen} />
    </>
  )
}