import { userModel } from '#models/userModel.js'
import { breedModel } from '#models/breedModel.js'
import { speciesModel } from '#models/speciesModel.js'

export const runValidations = async ({ data }) => {
  const validations = []

  if (data.cliente_id !== undefined) {
    validations.push({ validate: validateUser, value: data.cliente_id })
  }
  if (data.raza_id !== undefined) {
    validations.push({ validate: validateBreed, value: data.raza_id })
  }
  if (data.especie_id !== undefined) {
    validations.push({ validate: validateSpecies, value: data.especie_id })
  }

  if (validations.length === 0) return { error: null }

  const results = await Promise.all(
    validations.map(({ validate, value }) => validate(value))
  )

  const error = results.find(result => result.error)?.error || null

  return { error }
}

async function validateUser (userId) {
  const user = await userModel.getById({ id: userId })

  if (user.length === 0) return { error: 'User not found' }

  return { error: null }
}

async function validateBreed (breedId) {
  const breed = await breedModel.getById({ id: breedId })

  if (breed.length === 0) return { error: 'Breed not found' }

  return { error: null }
}

async function validateSpecies (speciesId) {
  const species = await speciesModel.getById({ id: speciesId })

  if (species.length === 0) return { error: 'Species not found' }

  return { error: null }
}
