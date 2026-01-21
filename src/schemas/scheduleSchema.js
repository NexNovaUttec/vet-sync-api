import { z } from 'zod'

const ScheduleSchema = z.object({
  profesional_id: z.string({
    required_error: 'El ID del profesional es obligatorio',
    invalid_type_error: 'El ID del profesional debe ser una cadena de texto'
  })
    .min(1, 'El ID del profesional es obligatorio')
    .max(50, 'El ID del profesional no debe exceder los 50 caracteres')
    .trim(),

  hora_inicio: z.string({
    required_error: 'La hora de inicio es obligatoria',
    invalid_type_error: 'La hora de inicio debe ser una cadena de texto'
  })
    .regex(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]:[0-5][0-9]$/, 'El formato de hora debe ser HH:MM:SS')
    .trim(),

  hora_fin: z.string({
    required_error: 'La hora de fin es obligatoria',
    invalid_type_error: 'La hora de fin debe ser una cadena de texto'
  })
    .regex(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]:[0-5][0-9]$/, 'El formato de hora debe ser HH:MM:SS')
    .trim(),

  dias_trabajo: z.string({
    required_error: 'Los días de trabajo son obligatorios',
    invalid_type_error: 'Los días de trabajo deben ser una cadena de texto'
  })
    .trim()
    .min(1, 'Los días de trabajo son obligatorios')
    .max(10, 'Los días de trabajo no deben exceder los 10 caracteres')
    .regex(/^[LMWJVSD]+$/, 'Solo se permiten las iniciales de los días: L, M, W, J, V, S, D')
    .refine(value => {
      const chars = value.split('')
      return chars.length === new Set(chars).size
    }, 'No se permiten días duplicados')
})

export function validateSchedule (object) {
  return ScheduleSchema.safeParse(object)
}

export function validatePartialSchedule (object) {
  return ScheduleSchema.partial().safeParse(object)
}
