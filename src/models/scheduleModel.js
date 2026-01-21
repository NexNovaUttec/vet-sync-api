import { supabase } from '#databases/index.js'

export class scheduleModel {
  static async addSchedule ({ input }) {
    try {
      const { data: schedule, error } = await supabase.from('horarios_profesionales').insert({ ...input }).select()
      if (error) throw new Error(error.message)

      return schedule
    } catch (error) {
      throw new Error(error.message)
    }
  }

  static async getAllSchedules ({ profesional_id }) {
    let query = supabase.from('horarios_profesionales').select()

    if (profesional_id) {
      query = query.eq('profesional_id', profesional_id)
    }
    try {
      const { data: schedules, error } = await query

      if (error) throw new Error(error.message)

      return schedules
    } catch (error) {
      throw new Error(error.message)
    }
  }

  static async getById ({ id }) {
    try {
      const { data: schedule, error } = await supabase.from('horarios_profesionales').select().eq('id', id)

      if (error) throw new Error(error.message)

      return schedule
    } catch (error) {
      throw new Error(error.message)
    }
  }

  static async updateSchedule ({ id, input }) {
    const updateData = {}

    if (input.profesional_id) updateData.profesional_id = input.profesional_id
    if (input.hora_inicio) updateData.hora_inicio = input.hora_inicio
    if (input.hora_fin) updateData.hora_fin = input.hora_fin
    if (input.dias_trabajo) updateData.dias_trabajo = input.dias_trabajo

    if (Object.keys(updateData).length === 0) {
      return await this.getById({ id })
    }

    try {
      const { data: schedule, error } = await supabase.from('horarios_profesionales').update(updateData).eq('id', id).select()

      if (error) throw new Error(error.message)

      return schedule
    } catch (error) {
      throw new Error(error.message)
    }
  }

  static async deleteSchedule ({ id }) {
    try {
      const { data: deletedSchedule, error } = await supabase.from('horarios_profesionales').delete().eq('id', id).select()

      if (error) throw new Error(error.message)

      return deletedSchedule
    } catch (error) {
      throw new Error(error.message)
    }
  }

  static async getScheduleForDay ({ profesionalId, dayPattern }) {
    try {
      const { data: schedules, error } = await supabase
        .from('horarios_profesionales')
        .select()
        .eq('profesional_id', profesionalId)
        .ilike('dias_trabajo', dayPattern)

      if (error) throw new Error(error.message)

      return schedules
    } catch (error) {
      throw new Error(error.message)
    }
  }
}
