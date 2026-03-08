import { supabase } from '#databases/index.js'

export class vetModel {
  static async addVet ({ input }) {
    const { nombre, apellido, email, telefono, especialidad } = input

    try {
      const { data: vet, error } = await supabase.from('profesionales').insert({
        nombre,
        apellido,
        email,
        telefono,
        especialidad
      }).select()

      if (error) throw new Error(error.message)

      return vet
    } catch (error) {
      throw new Error(error.message)
    }
  }

  static async getAllVets () {
    const { data: vets, error } = await supabase
      .from('profesionales')
      .select('*, profesional_categorias(categoria_id, activo, categorias_servicio(*)), horarios_profesionales(*)')

    if (error) throw new Error(error.message)

    return vets
  }

  static async getById ({ id }) {
    const { data: vet, error } = await supabase
      .from('profesionales')
      .select('*, profesional_categorias(categoria_id, activo, categorias_servicio(*)), horarios_profesionales(*)')
      .eq('id', id)

    if (error) throw new Error(error.message)

    return vet
  }

  static async updateVet ({ id, input }) {
    const updateData = {}

    if (input.nombre) updateData.nombre = input.nombre
    if (input.apellido) updateData.apellido = input.apellido
    if (input.email) updateData.email = input.email
    if (input.telefono) updateData.telefono = input.telefono
    if (input.especialidad) updateData.especialidad = input.especialidad

    if (Object.keys(updateData).length === 0) {
      return await this.getById({ id })
    }

    try {
      const { data: vet, error } = await supabase.from('profesionales').update(updateData).eq('id', id).select()

      if (error) throw new Error(error.message)

      return vet
    } catch (error) {
      throw new Error(error.message)
    }
  }

  static async deleteVet ({ id }) {
    try {
      const { error } = await supabase.from('profesionales').update({ activo: false }).eq('id', id)

      if (error) throw new Error(error.message)

      const deletedVet = await this.getById({ id })
      return deletedVet
    } catch (error) {
      throw new Error(error.message)
    }
  }

  static async assignCategories ({ id, categories }) {
    try {
      // Delete existing categories
      await supabase.from('profesional_categorias').delete().eq('profesional_id', id)

      // Insert new ones if any
      if (categories && categories.length > 0) {
        const inserts = categories.map(catId => ({
          profesional_id: id,
          categoria_id: catId,
          activo: true
        }))

        const { error } = await supabase.from('profesional_categorias').insert(inserts)
        if (error) throw new Error(error.message)
      }

      return await this.getById({ id })
    } catch (error) {
      throw new Error(error.message)
    }
  }
}
