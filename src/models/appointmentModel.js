import { supabase } from '#databases/index.js'
import { calcularHoraFin } from '#utils/timeUtils.js'
import { serviceModel } from './serviceModel.js'

export class AppointmentModel {
  static async getAllAppointments () {
    try {
      const { data: appointments, error } = await supabase.from('citas').select()

      if (error) throw error

      return appointments
    } catch (error) {
      throw error
    }
  }

  static async getById ({ id }) {
    try {
      const { data: appointment, error } = await supabase.from('citas').select().eq('id', id)

      if (error) throw error

      return appointment
    } catch (error) {
      throw error
    }
  }

  static async getDetailedAppointments ({ clienteId }) {
    try {
      const { data: appointments, error } = await supabase.rpc('obtener_citas_detalle', { p_cliente_id: clienteId ?? null })

      if (error) throw error

      return appointments
    } catch (error) {
      throw error
    }
  }

  static async getDetailedAppointment ({ id }) {
    try {
      const { data: appointment, error } = await supabase.rpc(
        'obtener_citas_detalle',
        { p_cita_id: id ?? null }
      )

      if (error) throw error

      return appointment
    } catch (error) {
      throw error
    }
  }

  static async addAppointment ({ input }) {
    const { servicio_id, hora_inicio } = input

    try {
      const service = await serviceModel.getById({ id: servicio_id })
      if (!service || service.length === 0) {
        throw new Error('Servicio no encontrado para calcular la duración de la cita.')
      }
      const duracionEstimada = service[0].duracion_estimada
      const hora_fin = calcularHoraFin(hora_inicio, duracionEstimada)
      const appointmentData = {
        ...input,
        hora_fin
      }

      const { data: appointment, error } = await supabase.from('citas').insert(appointmentData).select()

      if (error) throw error

      return appointment
    } catch (error) {
      throw error
    }
  }

  static async updateAppointment ({ id, input }) {
    const updateData = {}

    if (input.cliente_id) updateData.cliente_id = input.cliente_id
    if (input.mascota_id) updateData.mascota_id = input.mascota_id
    if (input.profesional_id) updateData.profesional_id = input.profesional_id
    if (input.servicio_id) updateData.servicio_id = input.servicio_id
    if (input.fecha) updateData.fecha_cita = input.fecha
    if (input.status) updateData.status = input.status
    if (input.hora_inicio) updateData.hora_cita = input.hora_cita
    if (input.motivo_consulta) updateData.motivo_consulta = input.motivo_consulta

    if (Object.keys(updateData).length === 0) {
      return await this.getById({ id })
    }

    try {
      const { data: appointment, error } = await supabase.from('citas').update(updateData).eq('id', id).select()

      if (error) throw error

      return appointment
    } catch (error) {
      throw error
    }
  }

  static async deleteAppointment ({ id }) {
    try {
      const { data: appointment, error } = await supabase.from('citas').delete().eq('id', id).select()

      if (error) throw error

      return appointment
    } catch (error) {
      throw error
    }
  }

  static async findOverlappingAppointments ({ fecha, hora_inicio, hora_fin, profesional_id, cliente_id, mascota_id }) {
    try {
      let query = supabase.from('citas')
        .select()
        .eq('fecha', fecha)
        .in('status', ['Programada', 'Reprogramada', 'En Curso'])

      if (profesional_id) {
        query = query.eq('profesional_id', profesional_id)
      }

      if (cliente_id) {
        query = query.eq('cliente_id', cliente_id)
      }

      if (mascota_id) {
        query = query.eq('mascota_id', mascota_id)
      }

      const { data: appointments, error } = await query

      if (error) throw error

      const convertToMinutes = (timeStr) => {
        const [h, m] = timeStr.split(':').map(Number)
        return h * 60 + m
      }

      const newStartMinutes = convertToMinutes(hora_inicio)
      const newEndMinutes = convertToMinutes(hora_fin)

      const overlappingAppointments = appointments.filter(appointment => {
        const existingStartTime = appointment.hora_inicio
        const existingEndTime = appointment.hora_fin

        const existingStartMinutes = convertToMinutes(existingStartTime)
        const existingEndMinutes = convertToMinutes(existingEndTime)

        return (
          (newStartMinutes >= existingStartMinutes && newStartMinutes < existingEndMinutes) ||
          (newEndMinutes > existingStartMinutes && newEndMinutes <= existingEndMinutes) ||
          (newStartMinutes <= existingStartMinutes && newEndMinutes >= existingEndMinutes)
        )
      })

      return overlappingAppointments
    } catch (error) {
      throw error
    }
  }
}
