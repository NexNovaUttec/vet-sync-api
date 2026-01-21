import { petModel } from '#models/petModel.js'
import { vetModel } from '#models/vetModel.js'
import { AppointmentModel } from '#models/appointmentModel.js'
import { scheduleModel } from '#models/scheduleModel.js'
import { serviceModel } from '#models/serviceModel.js'
import { checkIfTimeIsWithinRange, isValidTimeFormat, calcularHoraFin, getCurrentDateTime } from '#utils/timeUtils.js'

export async function runValidations (data) {
  // Acumula errores para devolver todas las validaciones fallidas juntas
  const errors = []

  // 1. Valida que la mascota exista y pertenezca al cliente indicado
  const pet = await validatePet(data.mascota_id, data.cliente_id)
  if (pet.error) errors.push(pet.error)

  // 2. Valida que la fecha no sea en el pasado
  const date = validateDate(data.fecha, data.hora_inicio)
  if (date.error) errors.push(date.error)

  // 3. Valida que la mascota no tenga citas en el mismo horario
  const petOverlap = await validatePetOverlap(data)
  if (petOverlap.error) errors.push(petOverlap.error)

  // 4. Valida disponibilidad de horario y superposiciones (solo si se proporciona profesional_id)
  if (data.profesional_id) {
    const vet = await validateVet(data.profesional_id)
    if (vet.error) errors.push(vet.error)

    const appointmentTime = await validateAppointmentTime(data)
    if (appointmentTime.error) errors.push(appointmentTime.error)
  }

  return {
    isValid: errors.length === 0,
    errors
  }
}

async function validatePet (petId, clientId) {
  try {
    const pet = await petModel.getById({ id: petId })

    if (!pet || pet.length === 0) {
      return { error: 'La mascota no existe' }
    }

    if (pet[0].cliente_id !== clientId) {
      return { error: 'La mascota no pertenece al cliente' }
    }

    return { error: null }
  } catch (error) {
    return { error: 'Error al validar la mascota' }
  }
}

async function validateVet (vetId) {
  try {
    const vet = await vetModel.getById({ id: vetId })

    if (!vet || vet.length === 0) {
      return { error: 'El veterinario no existe' }
    }

    if (!vet[0].activo) {
      return { error: 'El veterinario no está activo' }
    }

    return { error: null }
  } catch (error) {
    return { error: 'Error al validar el veterinario' }
  }
}

function validateDate (dateString, hora_inicio = null) {
  try {
    // Usar la hora local de CDMX en lugar de la hora del servidor
    const { currentDate, currentTime } = getCurrentDateTime()
    const [currentYear, currentMonth, currentDay] = currentDate.split('-').map(Number)
    const today = new Date(currentYear, currentMonth - 1, currentDay)

    // Crear fecha de la cita usando el constructor que evita problemas de timezone
    const [year, month, day] = dateString.split('-').map(Number)
    const appointmentDate = new Date(year, month - 1, day)

    // Si la fecha es anterior a hoy, es inválida
    if (appointmentDate < today) {
      return { error: 'La fecha no puede ser pasada' }
    }

    // Si es el mismo día y se proporciona hora_inicio, validar que sea futura
    if (appointmentDate.getTime() === today.getTime() && hora_inicio) {
      const [hours, minutes] = hora_inicio.split(':').map(Number)
      const appointmentDateTime = new Date(year, month - 1, day, hours, minutes)

      // Crear la fecha y hora actual usando la hora de CDMX
      const [currentHours, currentMinutes] = currentTime.split(':').map(Number)
      const currentDateTime = new Date(currentYear, currentMonth - 1, currentDay, currentHours, currentMinutes)

      // Dar un margen de 1 minuto para evitar problemas de timing
      const currentWithMargin = new Date(currentDateTime.getTime() + 60000) // +1 minuto

      if (appointmentDateTime < currentWithMargin) {
        return { error: 'La hora de la cita debe ser futura' }
      }
    }

    return { error: null }
  } catch (error) {
    return { error: 'Fecha inválida' }
  }
}

async function validatePetOverlap (appointmentData) {
  try {
    const { fecha, hora_inicio, servicio_id, mascota_id } = appointmentData

    if (!hora_inicio || !servicio_id || !mascota_id) {
      return { error: null } // Si no hay datos suficientes, no validamos overlap
    }

    if (!isValidTimeFormat(hora_inicio)) {
      return { error: null } // La validación de formato se hace en otro lado
    }

    const servicio = await serviceModel.getById({ id: servicio_id })
    if (!servicio || servicio.length === 0) {
      return { error: null } // La validación de servicio se hace en otro lado
    }

    const duracionMinutos = servicio[0].duracion_estimada || 30
    const hora_fin = calcularHoraFin(hora_inicio, duracionMinutos)

    const overlappingPetAppointments = await AppointmentModel.findOverlappingAppointments({
      mascota_id,
      fecha,
      hora_inicio,
      hora_fin
    })

    if (overlappingPetAppointments.length > 0) {
      return {
        error: 'La mascota ya tiene una cita agendada en ese horario'
      }
    }

    return { error: null }
  } catch (error) {
    console.error('Error al validar superposición de mascota:', error)
    return { error: 'Error al validar el horario de la mascota' }
  }
}

async function validateAppointmentTime (appointmentData) {
  try {
    const { profesional_id, cliente_id, fecha, hora_inicio, servicio_id } = appointmentData

    if (!hora_inicio) {
      return { error: 'Se requiere especificar la hora de inicio de la cita' }
    }

    if (!isValidTimeFormat(hora_inicio)) {
      return { error: 'El formato de hora debe ser HH:MM' }
    }

    if (!servicio_id) {
      return { error: 'Se requiere especificar el servicio para la cita' }
    }

    if (!profesional_id) {
      return { error: null }
    }

    const servicio = await serviceModel.getById({ id: servicio_id })

    if (!servicio || servicio.length === 0) {
      return { error: 'No se pudo obtener la información del servicio' }
    }

    const duracionMinutos = servicio[0].duracion_minutos || 30
    const hora_fin = calcularHoraFin(hora_inicio, duracionMinutos)

    // Obtener el día de la semana de manera consistente usando la fecha como string
    const [year, month, day] = fecha.split('-').map(Number)
    const appointmentDate = new Date(year, month - 1, day)
    const dayOfWeek = appointmentDate.getDay()
    const dayMap = {
      0: 'D', // Domingo
      1: 'L', // Lunes
      2: 'M', // Martes
      3: 'W', // Miércoles
      4: 'J', // Jueves
      5: 'V', // Viernes
      6: 'S' // Sábado
    }
    const dayLetter = dayMap[dayOfWeek]

    const schedules = await scheduleModel.getScheduleForDay({
      profesionalId: profesional_id,
      dayPattern: `%${dayLetter}%`
    })

    if (!schedules || schedules.length === 0) {
      return { error: 'El profesional no tiene horario asignado para este día' }
    }

    const profesionalSchedule = schedules[0]

    const startIsWithinHours = checkIfTimeIsWithinRange(
      hora_inicio,
      profesionalSchedule.hora_inicio,
      profesionalSchedule.hora_fin
    )

    const endIsWithinHours = checkIfTimeIsWithinRange(
      hora_fin,
      profesionalSchedule.hora_inicio,
      profesionalSchedule.hora_fin
    )

    if (!startIsWithinHours || !endIsWithinHours) {
      return {
        error: `La cita debe estar completamente dentro del horario del profesional: ${profesionalSchedule.hora_inicio} - ${profesionalSchedule.hora_fin}`
      }
    }

    const overlappingProfessionalAppointments = await AppointmentModel.findOverlappingAppointments({
      profesional_id,
      fecha,
      hora_inicio,
      hora_fin // Este valor es calculado, no proviene de la petición
    })

    if (overlappingProfessionalAppointments.length > 0) {
      return {
        error: 'El profesional ya tiene una cita agendada en ese horario'
      }
    }

    const overlappingClientAppointments = await AppointmentModel.findOverlappingAppointments({
      cliente_id,
      fecha,
      hora_inicio,
      hora_fin
    })

    if (overlappingClientAppointments.length > 0) {
      return {
        error: 'El cliente ya tiene una cita agendada en ese horario'
      }
    }

    return { error: null }
  } catch (error) {
    console.error('Error al validar horario de cita:', error)
    return { error: 'Error al validar el horario de la cita' }
  }
}
