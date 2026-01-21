import { vetModel } from '#models/vetModel.js'
import { scheduleModel } from '#models/scheduleModel.js'

// Días de la semana permitidos (L=Lunes, M=Martes, W=Miércoles, J=Jueves, V=Viernes, S=Sábado, D=Domingo)
const VALID_DAYS = new Set(['L', 'M', 'W', 'J', 'V', 'S', 'D'])

// Formato de hora: HH:MM o HH:MM:SS (24 horas)
const TIME_REGEX = /^([01]\d|2[0-3]):[0-5]\d(:[0-5]\d)?$/

export const runValidation = async ({ data, scheduleId = null }) => {
  // scheduleId se usa para actualizaciones, permite ignorar el horario actual durante la validación
  const validations = []
  if (data.profesional_id !== undefined) {
    validations.push({ validate: validateVet, value: data.profesional_id })
  }

  if (data.hora_inicio || data.hora_fin) {
    validations.push({
      validate: validateTimeFormat,
      value: {
        startTime: data.hora_inicio,
        endTime: data.hora_fin
      }
    })
  }

  if (data.dias_trabajo) {
    validations.push({
      validate: validateWorkingDays,
      value: data.dias_trabajo
    })
  }

  if (validations.length === 0) return { error: null }

  const results = await Promise.all(
    validations.map(({ validate, value }) => validate(value))
  )
  const error = results.find(result => result.error)?.error || null
  if (error) return { error }

  if (data.profesional_id && data.hora_inicio && data.hora_fin && data.dias_trabajo) {
    const conflictError = await checkScheduleConflicts({
      profesionalId: data.profesional_id,
      startTime: data.hora_inicio,
      endTime: data.hora_fin,
      workingDays: data.dias_trabajo,
      excludeScheduleId: scheduleId
    })

    if (conflictError) {
      return { error: conflictError }
    }
  }

  return { error: null }
}

async function validateVet (vetId) {
  const vet = await vetModel.getById({ id: vetId })

  if (!vet || vet.length === 0) {
    return { error: 'El veterinario no existe' }
  }

  if (!vet[0].activo) {
    return { error: 'El veterinario no está activo' }
  }

  return { error: null }
}

function validateTimeFormat ({ startTime, endTime }) {
  if (startTime && !TIME_REGEX.test(startTime)) {
    return { error: 'Formato de hora de inicio inválido. Use HH:MM o HH:MM:SS' }
  }

  if (endTime && !TIME_REGEX.test(endTime)) {
    return { error: 'Formato de hora de fin inválido. Use HH:MM o HH:MM:SS' }
  }

  if (startTime && endTime && startTime >= endTime) {
    return { error: 'La hora de inicio debe ser anterior a la hora de fin' }
  }

  return { error: null }
}

function validateWorkingDays (workingDays) {
  if (typeof workingDays !== 'string' || workingDays.length === 0) {
    return { error: 'Debe especificar al menos un día de trabajo' }
  }

  const days = workingDays.split('')
  const uniqueDays = new Set()

  for (const day of days) {
    if (!VALID_DAYS.has(day)) {
      return { error: `Día de trabajo inválido: '${day}'. Días válidos: ${Array.from(VALID_DAYS).join(', ')}` }
    }

    if (uniqueDays.has(day)) {
      return { error: `Día duplicado: '${day}'. Cada día debe aparecer solo una vez` }
    }

    uniqueDays.add(day)
  }

  return { error: null }
}

async function checkScheduleConflicts ({ profesionalId, startTime, endTime, workingDays, excludeScheduleId = null }) {
  // Obtener horarios existentes, excluyendo el actual si es una actualización
  const existingSchedules = await scheduleModel.getAllSchedules({ profesional_id: profesionalId })
  const otherSchedules = excludeScheduleId
    ? existingSchedules.filter(s => s.id !== excludeScheduleId)
    : existingSchedules

  // Mapeo de códigos de día a nombres completos para mensajes de error
  const dayNames = {
    'L': 'Lunes',
    'M': 'Martes',
    'W': 'Miércoles',
    'J': 'Jueves',
    'V': 'Viernes',
    'S': 'Sábado',
    'D': 'Domingo'
  }

  // Verificar cada horario existente en busca de conflictos
  for (const schedule of otherSchedules) {
    const scheduleDays = schedule.dias_trabajo.split('')
    const commonDays = workingDays.split('').filter(day => scheduleDays.includes(day))

    if (commonDays.length === 0) continue // No hay días en común, no hay conflicto

    // Verificar superposición de horarios
    const isTimeOverlap = (
      (startTime >= schedule.hora_inicio && startTime < schedule.hora_fin) ||
      (endTime > schedule.hora_inicio && endTime <= schedule.hora_fin) ||
      (startTime <= schedule.hora_inicio && endTime >= schedule.hora_fin)
    )

    if (isTimeOverlap) {
      const conflictDays = commonDays.map(day => dayNames[day]).join(', ')
      return `Conflicto de horario: El profesional ya tiene un horario programado de ${schedule.hora_inicio} a ${schedule.hora_fin} los días ${conflictDays}`
    }

    // No permitir múltiples horarios en el mismo día, incluso sin superposición
    const duplicateDayNames = commonDays.map(day => dayNames[day]).join(', ')
    return `El profesional ya tiene un horario asignado para los días: ${duplicateDayNames}. No se permite tener múltiples horarios en el mismo día.`
  }

  return null
}
