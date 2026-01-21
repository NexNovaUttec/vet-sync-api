import { speciesModel } from '#models/speciesModel.js'

export class SpeciesController {
  static async getAllSpecies (req, res) {
    const species = await speciesModel.getAllSpecies()

    if (species.length === 0) {
      return res.status(404).json({ error: 'Species not found' })
    }
    res.json({ message: 'Species found', data: species })
  }

  static async getById (req, res) {
    const { id } = req.params

    const species = await speciesModel.getById({ id })

    if (!species) {
      return res.status(404).json({ error: 'Species not found' })
    }
    res.json({ message: 'Species found', data: species })
  }

  static async getByName (req, res) {
    const { name } = req.params

    const species = await speciesModel.getByName({ name })

    if (!species) {
      return res.status(404).json({ error: 'Species not found' })
    }
    res.json({ message: 'Species found', data: species })
  }
}
