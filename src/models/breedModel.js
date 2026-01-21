import { supabase } from '#databases/index.js'

export class breedModel {
  static async getAllBreeds () {
    const { data: breeds, error } = await supabase.from('razas').select()

    if (error) throw new Error(error.message)

    return breeds
  }

  static async getById ({ id }) {
    const { data: breed, error } = await supabase.from('razas').select().eq('id', id)
    if (error) throw new Error(error.message)

    return breed
  }

  static async getByName ({ name }) {
    const { data: breed, error } = await supabase.from('razas').select().eq('nombre', name)
    if (error) throw new Error(error.message)

    return breed
  }

  static async getBySpecies ({ speciesId }) {
    const { data: breeds, error } = await supabase.from('razas').select().eq('especie_id', speciesId)
    if (error) throw new Error(error.message)

    return breeds
  }
}
