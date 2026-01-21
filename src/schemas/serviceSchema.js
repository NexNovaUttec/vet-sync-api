import { z } from 'zod'

const ServiceSchema = z.object({
  nombre: z.string({
    required_error: 'El nombre del servicio es obligatorio',
    invalid_type_error: 'El nombre debe ser una cadena de texto'
  })
    .trim()
    .min(1, 'El nombre del servicio es obligatorio')
    .max(100, 'El nombre no debe exceder los 100 caracteres'),

  descripcion: z.string({
    required_error: 'La descripción es obligatoria',
    invalid_type_error: 'La descripción debe ser una cadena de texto'
  })
    .trim()
    .min(1, 'La descripción es obligatoria')
    .max(255, 'La descripción no debe exceder los 255 caracteres'),

  categoria_id: z.number({
    required_error: 'La categoría es obligatoria',
    invalid_type_error: 'La categoría debe ser un número'
  })
    .int('La categoría debe ser un número entero')
    .positive('La categoría debe ser un número positivo'),

  precio: z.number({
    required_error: 'El precio es obligatorio',
    invalid_type_error: 'El precio debe ser un número'
  })
    .nonnegative('El precio no puede ser negativo')
    .transform(value => parseFloat(value.toFixed(2))), // Ensure 2 decimal places

  duracion_estimada: z.number({
    required_error: 'La duración estimada es obligatoria',
    invalid_type_error: 'La duración estimada debe ser un número'
  })
    .int('La duración estimada debe ser un número entero')
    .positive('La duración estimada debe ser un número positivo'),

  img_url: z.string()
    .url('La URL de la imagen debe ser válida')
    .nullable()
    .optional()
})

export function validateService (object) {
  return ServiceSchema.safeParse(object)
}

export function validatePartialService (object) {
  return ServiceSchema.partial().safeParse(object)
}
