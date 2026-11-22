'use client'

import { useState } from 'react'
import { Plus } from 'lucide-react'
import { Button } from '@/components/ui/button'
import type { PlanCandidate } from '../types/plan-types'
import PlanCourseDialog from './plan-course-dialog'

export default function AddPlanCourseButton({
  programId,
  durationSemesters,
  candidates,
}: {
  programId: string
  durationSemesters: number
  candidates: PlanCandidate[]
}) {
  const [open, setOpen] = useState(false)

  return (
    <>
      <Button onClick={() => setOpen(true)}>
        <Plus className="h-4 w-4" />
        Agregar curso
      </Button>
      <PlanCourseDialog
        open={open}
        onOpenChange={setOpen}
        programId={programId}
        durationSemesters={durationSemesters}
        mode={{ type: 'add', candidates }}
      />
    </>
  )
}