import { validatePet, validatePartialPet } from '#schemas/petSchema.js'
import { runValidations } from '#services/petValidation.js'
import { petModel } from '#models/petModel.js'

export class PetController {
  static async addPet (req, res) {
    const { data, error } = validatePet(req.body)

    if (error) {
      return res.status(422).json({ error: JSON.parse(error.message) })
    }

    const { error: userError } = await runValidations({ data })

    if (userError) {
      return res.status(422).json({ error: userError })
    }

    try {
      const pet = await petModel.addPet({ input: data })
      return res.status(201).json({ message: 'Pet created', data: pet })
    } catch (error) {
      return res.status(500).json({ error: error.message })
    }
  }

  static async getAllPets (req, res) {
    const pets = await petModel.getAllPets()

    if (pets.length === 0) {
      return res.status(200).json({ message: 'No pets found', data: [] })
    }
    res.json({ message: 'Pets found', data: pets })
  }

  static async getDetailedPet (req, res) {
    const { clienteId } = req.query
    const pets = await petModel.getDetailedPet({ clienteId })

    if (pets.length === 0) {
      return res.status(200).json({ message: 'Pets not found', data: [] })
    }
    res.json({ message: 'Pets found', data: pets })
  }

  static async getById (req, res) {
    const { id } = req.params
    const pet = await petModel.getById({ id })

    if (pet.length === 0) {
      return res.status(404).json({ error: 'Pet not found' })
    }
    res.json({ message: 'Pet found', data: pet })
  }

  static async getByUser (req, res) {
    const { userId } = req.params
    const pets = await petModel.getByUser({ userId })

    if (pets.length === 0) {
      return res.status(200).json({ message: 'No pets found for this user', data: [] })
    }
    res.json({ message: 'Pets found', data: pets })
  }

  static async updatePet (req, res) {
    const { id } = req.params
    const { data, error } = validatePartialPet(req.body)

    if (error) {
      return res.status(422).json({ error: JSON.parse(error.message) })
    }

    const { error: userError } = await runValidations({ data })

    if (userError) {
      return res.status(422).json({ error: userError })
    }

    try {
      const pet = await petModel.updatePet({ id, input: data })

      if (pet.length === 0) {
        return res.status(404).json({ error: 'Pet not found' })
      }

      res.json({ message: 'Pet updated', data: pet })
    } catch (error) {
      return res.status(500).json({ error: error.message })
    }
  }

  static async deletePet (req, res) {
    const { id } = req.params
    try {
      const pet = await petModel.deletePet({ id })

      if (pet.length === 0) {
        return res.status(404).json({ error: 'Pet not found' })
      }

      res.json({ message: 'Pet deleted', data: pet })
    } catch (error) {
      return res.status(500).json({ error: error.message })
    }
  }
}
