import { supabase } from '#databases/index.js'

export class categoryModel {
  static async getAllCategories ({ name }) {
    let query = supabase.from('categorias_servicio').select()

    if (name) {
      query = query.eq('nombre', name)
    }

    try {
      const { data: categories, error } = await query

      if (error) throw new Error(error.message)

      return categories
    } catch (error) {
      throw error
    }
  }

  static async getById ({ id }) {
    try {
      const { data: category, error } = await supabase.from('categorias_servicio')
        .select()
        .eq('id', id)

      if (error) throw new Error(error.message)

      return category
    } catch (error) {
      throw error
    }
  }
}
