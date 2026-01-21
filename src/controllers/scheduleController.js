import { validateSchedule, validatePartialSchedule } from '#schemas/scheduleSchema.js'
import { scheduleModel } from '#models/scheduleModel.js'
import { runValidation } from '../services/scheduleValidation.js'

export class ScheduleController {
  static async addSchedule (req, res) {
    const { data, error } = validateSchedule(req.body)

    if (error) {
      return res.status(422).json({ error: JSON.parse(error.message) })
    }

    const { error: validationError } = await runValidation({ data })

    if (validationError) {
      return res.status(422).json({ error: validationError })
    }

    try {
      const schedule = await scheduleModel.addSchedule({ input: data })
      return res.status(201).json({ message: 'Schedule created', data: schedule })
    } catch (error) {
      return res.status(500).json({ error: error.message })
    }
  }

  static async getAllSchedules (req, res) {
    const { profesional_id } = req.query

    try {
      const schedules = await scheduleModel.getAllSchedules({ profesional_id })

      if (schedules.length === 0) {
        return res.status(404).json({ error: 'Schedules not found' })
      }
      res.json({ message: 'Schedules found', data: schedules })
    } catch (error) {
      return res.status(500).json({ error: error.message })
    }
  }

  static async getById (req, res) {
    const { id } = req.params

    try {
      const schedule = await scheduleModel.getById({ id })

      if (schedule.length === 0) {
        return res.status(404).json({ error: 'Schedule not found' })
      }
      res.json({ message: 'Schedule found', data: schedule })
    } catch (error) {
      return res.status(500).json({ error: error.message })
    }
  }

  static async updateSchedule (req, res) {
    const { id } = req.params
    const { data, error } = validatePartialSchedule(req.body)

    if (error) {
      return res.status(422).json({ error: JSON.parse(error.message) })
    }

    const { error: validationError } = await runValidation({ data })

    if (validationError) {
      return res.status(422).json({ error: validationError })
    }

    try {
      const schedule = await scheduleModel.updateSchedule({ id, input: data })

      if (schedule.length === 0) {
        return res.status(404).json({ error: 'Schedule not found' })
      }

      res.json({ message: 'Schedule updated', data: schedule })
    } catch (error) {
      return res.status(500).json({ error: error.message })
    }
  }

  static async deleteSchedule (req, res) {
    const { id } = req.params

    try {
      const schedule = await scheduleModel.deleteSchedule({ id })

      if (schedule.length === 0) {
        return res.status(404).json({ error: 'Schedule not found' })
      }

      res.json({ message: 'Schedule deleted', data: schedule })
    } catch (error) {
      return res.status(500).json({ error: error.message })
    }
  }
}
