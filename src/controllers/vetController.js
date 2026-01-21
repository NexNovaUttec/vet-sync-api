import { validateVet, validatePartialVet } from '#schemas/vetSchema.js'
import { vetModel } from '#models/vetModel.js'

export class VetController {
  static async addVet (req, res) {
    const result = validateVet(req.body)

    if (result.error) {
      return res.status(422).json({ error: JSON.parse(result.error.message) })
    }

    try {
      const vet = await vetModel.addVet({ input: result.data })
      return res.status(201).json({ message: 'Vet created', data: vet })
    } catch (error) {
      return res.status(500).json({ error: error.message })
    }
  }

  static async getAllVets (req, res) {
    const vets = await vetModel.getAllVets()

    if (vets.length === 0) {
      return res.status(404).json({ error: 'Vets not found' })
    }

    res.json({ message: 'Vets found', data: vets })
  }

  static async getById (req, res) {
    const { id } = req.params

    const vet = await vetModel.getById({ id })

    if (vet.length === 0) {
      return res.status(404).json({ error: 'Vet not found' })
    }

    res.json({ message: 'Vet found', data: vet })
  }

  static async updateVet (req, res) {
    const { id } = req.params
    const result = validatePartialVet(req.body)

    if (result.error) {
      return res.status(422).json({ error: JSON.parse(result.error.message) })
    }

    try {
      const updatedVet = await vetModel.updateVet({ id, input: result.data })

      if (updatedVet.length === 0) {
        return res.status(404).json({ error: 'Vet not found' })
      }

      res.json({ message: 'Vet updated', data: updatedVet })
    } catch (error) {
      return res.status(500).json({ error: error.message })
    }
  }

  static async deleteVet (req, res) {
    const { id } = req.params

    try {
      const deletedVet = await vetModel.deleteVet({ id })

      if (deletedVet.length === 0) {
        return res.status(404).json({ error: 'Vet not found' })
      }

      res.json({ message: 'Vet deleted', data: deletedVet })
    } catch (error) {
      return res.status(500).json({ error: error.message })
    }
  }
}
