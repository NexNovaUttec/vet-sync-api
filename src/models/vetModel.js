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
    const { data: vets, error } = await supabase.from('profesionales').select()

    if (error) throw new Error(error.message)

    return vets
  }

  static async getById ({ id }) {
    const { data: vet, error } = await supabase.from('profesionales').select().eq('id', id)

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
}
