import { z } from 'zod'
import { PLAN_KINDS } from '../constants'

export const planCourseSchema = z.object({
  programId: z.string().uuid(),
  courseId: z.string().uuid(),
  semester: z.number().int().min(1, 'Semestre inválido').max(20, 'Semestre inválido'),
  kind: z.enum(PLAN_KINDS),
})

export type PlanCourseInput = z.infer<typeof planCourseSchema>