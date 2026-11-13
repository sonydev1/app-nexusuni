import { z } from 'zod'

const intString = (min: number, max: number) =>
  z
    .string()
    .trim()
    .refine((v) => /^\d+$/.test(v) && Number(v) >= min && Number(v) <= max, {
      message: `Número entero entre ${min} y ${max}`,
    })

export const courseSchema = z.object({
  code: z
    .string()
    .trim()
    .toUpperCase()
    .min(3, 'Mínimo 3 caracteres')
    .max(12, 'Máximo 12 caracteres')
    .regex(/^[A-Z0-9-]+$/, 'Solo letras, números y guiones'),
  name: z.string().trim().min(3, 'Mínimo 3 caracteres').max(120, 'Máximo 120 caracteres'),
  department_id: z.string().uuid('Selecciona un departamento'),
  credits: intString(1, 12),
  weekly_hours: intString(1, 40),
  description: z.string().trim().max(500, 'Máximo 500 caracteres'),
  prerequisite_ids: z.array(z.string().uuid()).max(10, 'Máximo 10 prerrequisitos'),
})

export const updateCourseSchema = courseSchema.extend({ id: z.string().uuid() })

export type CourseValues = z.infer<typeof courseSchema>
export type UpdateCourseValues = z.infer<typeof updateCourseSchema>