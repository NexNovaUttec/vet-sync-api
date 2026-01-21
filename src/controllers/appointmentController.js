import { validateAppointment, validatePartialAppointment } from '#schemas/appointmentSchema.js'
import { AppointmentModel } from '#models/appointmentModel.js'
import { runValidations } from '#services/appointmentValidation.js'
import { assignProfessional } from '#services/professionalAssignment.js'

export class AppointmentController {
  static async getAllAppointments (req, res) {
    try {
      const appointments = await AppointmentModel.getAllAppointments()

      if (appointments.length === 0) {
        return res.status(200).json({ message: 'No appointments found', data: [] })
      }

      return res.json({ message: 'Appointments found', data: appointments })
    } catch (error) {
      return res.status(500).json({ error: error.message })
    }
  }

  static async getById (req, res) {
    const { id } = req.params

    try {
      const appointment = await AppointmentModel.getById({ id })

      if (appointment.length === 0) {
        return res.status(404).json({ error: 'Appointment not found' })
      }

      return res.json({ message: 'Appointment found', data: appointment })
    } catch (error) {
      return res.status(500).json({ error: error.message })
    }
  }

  static async getDetailedAppointments (req, res) {
    const { clienteId } = req.query

    try {
      const appointments = await AppointmentModel.getDetailedAppointments({ clienteId })

      if (appointments.length === 0) {
        return res.status(200).json({ message: 'No appointments found', data: [] })
      }

      return res.json({ message: 'Appointments found', data: appointments })
    } catch (error) {
      return res.status(500).json({ error: error.message })
    }
  }

  static async getDetailedAppointment (req, res) {
    const { id } = req.params

    try {
      const appointment = await AppointmentModel.getDetailedAppointment({ id })

      if (appointment.length === 0) {
        return res.status(404).json({ error: 'Appointment not found' })
      }

      return res.json({ message: 'Appointment found', data: appointment })
    } catch (error) {
      return res.status(500).json({ error: error.message })
    }
  }

  static async addAppointment (req, res) {
    const result = validateAppointment(req.body)

    if (result.error) {
      return res.status(422).json({ error: JSON.parse(result.error.message) })
    }

    try {
      // 1. Validaciones básicas
      const validation = await runValidations(result.data)

      if (!validation.isValid) {
        return res.status(400).json({
          error: 'Error de validación',
          details: validation.errors
        })
      }

      // 2. Asignación automática de profesional
      const assignmentResult = await assignProfessional(result.data)

      if (!assignmentResult.success) {
        const statusCode = assignmentResult.code === 'NO_AVAILABILITY' ? 409 : 400

        const response = {
          error: assignmentResult.error,
          code: assignmentResult.code
        }

        // Agregar sugerencias si existen
        if (assignmentResult.sugerencias) {
          response.sugerencias = assignmentResult.sugerencias
        }

        return res.status(statusCode).json(response)
      }

      // 3. Crear la cita con el profesional asignado
      const appointmentData = {
        ...result.data,
        profesional_id: assignmentResult.professional.id
      }

      const appointment = await AppointmentModel.addAppointment({ input: appointmentData })

      // 4. Respuesta exitosa según la especificación
      return res.status(201).json({
        success: true,
        cita: {
          id: appointment[0].id,
          fecha: appointment[0].fecha,
          hora: appointment[0].hora_inicio,
          servicio: {
            id: assignmentResult.servicio.id,
            nombre: assignmentResult.servicio.nombre,
            duracion_estimada: assignmentResult.servicio.duracion_estimada
          },
          profesional: {
            id: assignmentResult.professional.id,
            nombre: assignmentResult.professional.nombre,
            apellido: assignmentResult.professional.apellido,
            especialidad: assignmentResult.professional.especialidad
          },
          mascota: {
            id: appointmentData.mascota_id
          }
        }
      })
    } catch (error) {
      console.error('Error inesperado:', error)
      return res.status(500).json({ error: 'Error interno del servidor' })
    }
  }

  static async updateAppointment (req, res) {
    const { id } = req.params
    const result = validatePartialAppointment(req.body)

    if (result.error) {
      return res.status(422).json({ error: JSON.parse(result.error.message) })
    }

    try {
      const appointment = await AppointmentModel.updateAppointment({ id, input: result.data })
      return res.status(200).json({ message: 'Appointment updated', data: appointment })
    } catch (error) {
      return res.status(500).json({ error: error.message })
    }
  }

  static async deleteAppointment (req, res) {
    const { id } = req.params

    try {
      const appointment = await AppointmentModel.deleteAppointment({ id })

      if (appointment.length === 0) {
        return res.status(404).json({ error: 'Appointment not found' })
      }

      return res.json({ message: 'Appointment deleted', data: appointment })
    } catch (error) {
      return res.status(500).json({ error: error.message })
    }
  }
}
