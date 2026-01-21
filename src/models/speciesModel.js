import { supabase } from '#databases/index.js'

export class speciesModel {
  static async getAllSpecies () {
    const { data: species, error } = await supabase.from('especies').select()

    if (error) throw new Error(error.message)

    return species
  }

  static async getById ({ id }) {
    const { data: species, error } = await supabase.from('especies').select().eq('id', id)
    if (error) throw new Error(error.message)

    return species
  }

  static async getByName ({ name }) {
    const { data: species, error } = await supabase.from('especies').select().eq('nombre', name)
    if (error) throw new Error(error.message)

    return species
  }
}
