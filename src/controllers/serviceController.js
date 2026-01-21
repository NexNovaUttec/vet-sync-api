import { validateService, validatePartialService } from '#schemas/serviceSchema.js'
import { serviceModel } from '#models/serviceModel.js'
import { runValidations } from '#root/src/services/serviceValidation.js'
import { getCurrentDateTime } from '#utils/timeUtils.js'

export class ServiceController {
  static async getAllServices (req, res) {
    const { cat } = req.query

    try {
      const services = await serviceModel.getAllServices({ categoria_id: cat })

      if (services.length === 0) {
        return res.status(404).json({ error: 'Services not found' })
      }
      res.json({ message: 'Services found', data: services })
    } catch (error) {
      return res.status(500).json({ error: error.message })
    }
  }

  static async getById (req, res) {
    const { id } = req.params

    try {
      const service = await serviceModel.getById(id)

      if (service.length === 0) {
        return res.status(404).json({ error: 'Service not found' })
      }
      res.json({ message: 'Service found', data: service })
    } catch (error) {
      return res.status(500).json({ error: error.message })
    }
  }

  static async getActiveServices (req, res) {
    const { active } = req.params

    try {
      const services = await serviceModel.getActiveServices({ active })

      if (services.length === 0) {
        return res.status(404).json({ error: 'Services not found' })
      }

      res.json({ message: 'Services found', data: services })
    } catch (error) {
      return res.status(500).json({ error: error.message })
    }
  }

  static async addService (req, res) {
    const { data, error } = validateService(req.body)

    if (error) {
      return res.status(422).json({ error: JSON.parse(error.message) })
    }

    const { error: validationError } = await runValidations({ data })

    if (validationError) return res.status(404).json({ error: validationError })

    try {
      const service = await serviceModel.addService({ input: data })
      return res.status(201).json({ message: 'Service created', data: service })
    } catch (error) {
      return res.status(500).json({ error: error.message })
    }
  }

  static async updateService (req, res) {
    const { id } = req.params
    const { data, error } = validatePartialService(req.body)

    if (error) {
      return res.status(422).json({ error: JSON.parse(error.message) })
    }

    if (data.categoria_id) {
      const { error } = await runValidations({ data })
      if (error) return res.status(404).json({ error })
    }

    try {
      const service = await serviceModel.updateService({ id, input: data })
      return res.status(200).json({ message: 'Service updated', data: service })
    } catch (error) {
      return res.status(500).json({ error: error.message })
    }
  }

  static async deleteService (req, res) {
    const { id } = req.params

    try {
      const deletedService = await serviceModel.deleteService({ id })

      if (deletedService.length === 0) {
        return res.status(404).json({ error: 'Service not found' })
      }

      res.json({ message: 'Service deleted', data: deletedService })
    } catch (error) {
      return res.status(500).json({ error: error.message })
    }
  }

  static async getBlockedSlots (req, res) {
    const { id } = req.params
    const { fecha } = req.query

    // Validaciones básicas
    if (!fecha) {
      return res.status(400).json({
        error: 'El parámetro fecha es requerido'
      })
    }

    const { currentDate } = getCurrentDateTime()
    if (fecha < currentDate) {
      return res.status(400).json({
        error: 'La fecha no puede ser pasada'
      })
    }

    try {
      const blockedSlots = await serviceModel.getBlockedSlots({
        servicio_id: id,
        fecha
      })

      return res.status(200).json({
        success: true,
        data: {
          servicio_id: parseInt(id),
          fecha,
          blocked_slots: blockedSlots.map(slot => slot.hora_formateada)
        }
      })
    } catch (error) {
      return res.status(500).json({ error: error.message })
    }
  }
}
