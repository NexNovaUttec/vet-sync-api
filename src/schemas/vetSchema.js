import { z } from 'zod'

const VetSchema = z.object({
  nombre: z.string({
    required_error: 'El nombre es obligatorio',
    invalid_type_error: 'El nombre debe ser una cadena de texto'
  })
    .min(1, 'El nombre es obligatorio')
    .max(100, 'El nombre no debe exceder los 100 caracteres')
    .trim(),

  apellido: z.string({
    required_error: 'El apellido es obligatorio',
    invalid_type_error: 'El apellido debe ser una cadena de texto'
  })
    .min(1, 'El apellido es obligatorio')
    .max(100, 'El apellido no debe exceder los 100 caracteres')
    .trim(),

  email: z.string({
    required_error: 'El correo electrónico es obligatorio',
    invalid_type_error: 'El correo electrónico debe ser una cadena de texto'
  })
    .email('El correo electrónico no es válido')
    .max(150, 'El correo electrónico no debe exceder los 150 caracteres')
    .trim(),

  telefono: z.string()
    .max(20, 'El teléfono no debe exceder los 20 caracteres')
    .trim()
    .optional()
    .or(z.literal('')),

  especialidad: z.string()
    .min(1, 'La especialidad es obligatoria')
    .max(100, 'La especialidad no debe exceder los 100 caracteres')
    .trim()
})

export function validateVet (object) {
  return VetSchema.safeParse(object)
}

export function validatePartialVet (object) {
  return VetSchema.partial().safeParse(object)
}
