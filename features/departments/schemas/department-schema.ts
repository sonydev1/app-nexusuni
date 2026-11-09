import { z } from 'zod'

export const departmentSchema = z.object({
  code: z
    .string()
    .trim()
    .toUpperCase()
    .min(2, 'Mínimo 2 caracteres')
    .max(10, 'Máximo 10 caracteres')
    .regex(/^[A-Z0-9-]+$/, 'Solo letras, números y guiones'),
  name: z
    .string()
    .trim()
    .min(3, 'Mínimo 3 caracteres')
    .max(100, 'Máximo 100 caracteres'),
  description: z.string().trim().max(500, 'Máximo 500 caracteres'),
})

export const updateDepartmentSchema = departmentSchema.extend({
  id: z.string().uuid(),
})

export type DepartmentValues = z.infer<typeof departmentSchema>
export type UpdateDepartmentValues = z.infer<typeof updateDepartmentSchema>