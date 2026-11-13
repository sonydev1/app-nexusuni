'use client'

import { useState } from 'react'
import { Plus } from 'lucide-react'
import { Button } from '@/components/ui/button'
import type { DepartmentOption } from '@/features/programs/types/program-types'
import type { CourseOption } from '../types/course-types'
import CourseDialog from './course-dialog'

export default function NewCourseButton({
  departments,
  courseOptions,
}: {
  departments: DepartmentOption[]
  courseOptions: CourseOption[]
}) {
  const [open, setOpen] = useState(false)

  return (
    <>
      <Button onClick={() => setOpen(true)}>
        <Plus className="h-4 w-4" />
        <span className="hidden sm:inline">Nuevo curso</span>
        <span className="sm:hidden">Nuevo</span>
      </Button>
      <CourseDialog
        open={open}
        onOpenChange={setOpen}
        departments={departments}
        courseOptions={courseOptions}
      />
    </>
  )
}