import { z } from 'zod'

const PetSchema = z.object({
  nombre: z.string({
    required_error: 'El nombre es obligatorio',
    invalid_type_error: 'El nombre debe ser una cadena de texto'
  })
    .min(1, 'El nombre es obligatorio')
    .max(100, 'El nombre no debe exceder los 100 caracteres')
    .regex(/^[a-zA-ZáéíóúüñÁÉÍÓÚÜÑ\s]+$/, 'El nombre solo debe contener letras y espacios')
    .trim(),

  cliente_id: z.string({
    required_error: 'El ID del cliente es obligatorio',
    invalid_type_error: 'El ID del cliente debe ser una cadena de texto'
  }),

  especie_id: z.number({
    required_error: 'El ID de la especie es obligatorio',
    invalid_type_error: 'El ID de la especie debe ser un número'
  }),

  raza_id: z.number({
    required_error: 'El ID de la raza es obligatorio',
    invalid_type_error: 'El ID de la raza debe ser un número'
  }),

  edad: z.number({
    invalid_type_error: 'La edad debe ser un número'
  })
    .positive('La edad debe ser mayor a 0')
    .max(30, 'La edad debe ser menor a 30 años')
    .optional(),

  sexo: z.enum(['M', 'H'])
    .describe('El sexo debe ser M o H')
    .optional()
    .refine(val => val !== undefined, {
      message: 'El sexo es obligatorio'
    }),

  img_url: z.string().optional()
})

export function validatePet (object) {
  return PetSchema.safeParse(object)
}

export function validatePartialPet (object) {
  return PetSchema.partial().safeParse(object)
}
