'use client'

import { useState } from 'react'
import { Plus } from 'lucide-react'
import { Button } from '@/components/ui/button'
import type { DepartmentOption } from '../types/program-types'
import ProgramDialog from './program-dialog'

export default function NewProgramButton({ departments }: { departments: DepartmentOption[] }) {
  const [open, setOpen] = useState(false)

  return (
    <>
      <Button onClick={() => setOpen(true)}>
        <Plus className="h-4 w-4" />
        <span className="hidden sm:inline">Nueva carrera</span>
        <span className="sm:hidden">Nueva</span>
      </Button>
      <ProgramDialog open={open} onOpenChange={setOpen} departments={departments} />
    </>
  )
}