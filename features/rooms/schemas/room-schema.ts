import { z } from 'zod'
import { ROOM_KINDS } from '../constants';

export const roomSchema = z.object({
  code: z
    .string()
    .trim()
    .toUpperCase()
    .min(2, 'Mínimo 2 caracteres')
    .max(12, 'Máximo 12 caracteres')
    .regex(/^[A-Z0-9-]+$/, 'Solo letras, números y guiones'),
  name: z.string().trim().min(3, 'Mínimo 3 caracteres').max(100, 'Máximo 100 caracteres'),
  building: z.string().trim().max(60, 'Máximo 60 caracteres'),
  kind: z.enum(ROOM_KINDS),
  capacity: z
    .string()
    .trim()
    .refine((v) => /^\d+$/.test(v) && Number(v) >= 1 && Number(v) <= 1000, {
      message: 'Número entero entre 1 y 1000',
    }),
})

export type RoomValues = z.infer<typeof roomSchema>