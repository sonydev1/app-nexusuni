import { z } from 'zod'
import { PROGRAM_LEVELS } from '../constants'

const intString = (min: number, max: number) =>
  z
    .string()
    .trim()
    .refine((v) => /^\d+$/.test(v) && Number(v) >= min && Number(v) <= max, {
      message: `Número entero entre ${min} y ${max}`,
    })

export const programSchema = z.object({
  code: z
    .string()
    .trim()
    .toUpperCase()
    .min(2, 'Mínimo 2 caracteres')
    .max(10, 'Máximo 10 caracteres')
    .regex(/^[A-Z0-9-]+$/, 'Solo letras, números y guiones'),
  name: z.string().trim().min(3, 'Mínimo 3 caracteres').max(120, 'Máximo 120 caracteres'),
  department_id: z.string().uuid('Selecciona un departamento'),
  level: z.enum(PROGRAM_LEVELS),
  duration_semesters: intString(1, 20),
  total_credits: intString(1, 400),
  description: z.string().trim().max(500, 'Máximo 500 caracteres'),
})

export const updateProgramSchema = programSchema.extend({ id: z.string().uuid() })

export type ProgramValues = z.infer<typeof programSchema>
export type UpdateProgramValues = z.infer<typeof updateProgramSchema>