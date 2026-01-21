import { supabase } from '#databases/index.js'

/**
 * Asigna automáticamente un profesional disponible para una cita
 * Versión optimizada usando funciones de PostgreSQL
 * @param {Object} appointmentData - Datos de la cita
 * @param {number} appointmentData.servicio_id - ID del servicio (INTEGER)
 * @param {string} appointmentData.fecha - Fecha en formato YYYY-MM-DD
 * @param {string} appointmentData.hora_inicio - Hora en formato HH:MM
 * @returns {Object} - Resultado de la asignación
 */
export async function assignProfessional (appointmentData) {
  const { servicio_id, fecha, hora_inicio } = appointmentData

  try {
    // Ejecutar función principal de PostgreSQL para encontrar el mejor profesional
    const { data: result, error } = await supabase
      .rpc('find_best_professional_for_appointment', {
        p_servicio_id: parseInt(servicio_id), // Asegurar que sea INTEGER
        p_fecha: fecha,
        p_hora_inicio: hora_inicio
      })

    if (error) {
      console.error('Error ejecutando función de PostgreSQL:', error)
      return {
        success: false,
        error: 'Error interno en la asignación de profesional',
        code: 'INTERNAL_ERROR'
      }
    }

    const assignmentResult = result[0]

    if (!assignmentResult.success) {
      return {
        success: false,
        error: assignmentResult.error_message,
        code: assignmentResult.error_code
      }
    }

    // Éxito: retornar datos del profesional asignado
    return {
      success: true,
      professional: {
        id: assignmentResult.profesional_id,
        nombre: assignmentResult.profesional_nombre,
        apellido: assignmentResult.profesional_apellido
      },
      servicio: {
        nombre: assignmentResult.servicio_nombre,
        duracion_estimada: assignmentResult.duracion_estimada
      },
      hora_fin: assignmentResult.hora_fin
    }
  } catch (error) {
    console.error('Error en asignación automática:', error)
    return {
      success: false,
      error: 'Error interno en la asignación de profesional',
      code: 'INTERNAL_ERROR'
    }
  }
}

/**
 * Función de utilidad para calcular hora de fin
 * Mantiene compatibilidad con el código existente
 * @param {string} hora_inicio - Hora de inicio en formato HH:MM
 * @param {number} duracion_minutos - Duración en minutos
 * @returns {string} - Hora de fin en formato HH:MM
 */
export function calcularHoraFin (hora_inicio, duracion_minutos) {
  const [hours, minutes] = hora_inicio.split(':').map(Number)
  const totalMinutes = hours * 60 + minutes + duracion_minutos

  const endHours = Math.floor(totalMinutes / 60)
  const endMinutes = totalMinutes % 60

  return `${endHours.toString().padStart(2, '0')}:${endMinutes.toString().padStart(2, '0')}`
}
