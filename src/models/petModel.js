import { supabase } from '#databases/index.js'

export class petModel {
  static async addPet ({ input }) {
    const { nombre, cliente_id, especie_id, raza_id, edad, sexo } = input

    try {
      const { data: pet, error } = await supabase.from('mascotas').insert({
        nombre,
        cliente_id,
        especie_id,
        raza_id,
        edad,
        sexo
      }).select()

      if (error) throw new Error(error.message)

      return pet
    } catch (error) {
      throw new Error(error.message)
    }
  }

  static async getAllPets () {
    try {
      const { data: pets, error } = await supabase.from('mascotas').select()

      if (error) throw new Error(error.message)

      return pets
    } catch (error) {
      throw new Error(error.message)
    }
  }

  static async getDetailedPet ({ clienteId }) {
    try {
      const { data: pets, error } = await supabase.rpc('obtener_mascotas', { p_cliente_id: clienteId ?? null })

      if (error) throw new Error(error.message)

      return pets
    } catch (error) {
      throw new Error(error.message)
    }
  }

  static async getById ({ id }) {
    try {
      const { data: pet, error } = await supabase.from('mascotas').select().eq('id', id)

      if (error) throw new Error(error.message)

      return pet
    } catch (error) {
      throw new Error(error.message)
    }
  }

  static async updatePet ({ id, input }) {
    const updateData = {}
    let currentPet = null

    // Get current pet data to check for existing image
    if (input.img_url !== undefined && (input.img_url === null || input.img_url === 'null')) {
      currentPet = await this.getById({ id })
      if (currentPet.length === 0) {
        throw new Error('Pet not found')
      }
    }

    // Prepare update data
    if (input.nombre) updateData.nombre = input.nombre
    if (input.cliente_id) updateData.cliente_id = input.cliente_id
    if (input.especie_id) updateData.especie_id = input.especie_id
    if (input.raza_id) updateData.raza_id = input.raza_id
    if (input.edad) updateData.edad = input.edad
    if (input.sexo) updateData.sexo = input.sexo

    // Handle image URL update and deletion
    if (input.img_url !== undefined) {
      // If we're setting img_url to null and there was a previous image
      if ((input.img_url === null || input.img_url === 'null') && currentPet?.[0]?.img_url) {
        const currentImageUrl = currentPet[0].img_url
        // Extract the file path from the URL
        const urlParts = currentImageUrl.split('mascotas-imagenes/')
        if (urlParts.length > 1) {
          const filePath = `user-${currentPet[0].cliente_id}/${urlParts[1].split('/').pop()}`
          // Delete the image from storage
          await this.deleteImageFromStorage({ filePath })
        }
      }
      updateData.img_url = input.img_url === 'null' ? null : input.img_url
    }

    if (Object.keys(updateData).length === 0) {
      return await this.getById({ id })
    }

    try {
      const { data: pet, error } = await supabase.from('mascotas').update(updateData).eq('id', id).select()

      if (error) throw new Error(error.message)

      return pet
    } catch (error) {
      throw new Error(error.message)
    }
  }

  static async deletePet ({ id }) {
    try {
      const { error } = await supabase.from('mascotas').update({ activo: false }).eq('id', id)

      if (error) throw new Error(error.message)

      const deletedPet = await this.getById({ id })
      return deletedPet
    } catch (error) {
      throw new Error(error.message)
    }
  }

  static async uploadPetImage ({ petId, userId, file, fileName }) {
    try {
      // Primero verificar que la mascota existe
      const pet = await this.getById({ id: petId })
      if (pet.length === 0) {
        throw new Error('Pet not found')
      }

      // Si la mascota ya tiene una imagen, eliminarla primero
      if (pet[0].img_url) {
        // Extraer el path completo después del dominio
        const urlParts = pet[0].img_url.split('mascotas-imagenes/')
        if (urlParts.length > 1) {
          const oldPath = `user-${userId}/${urlParts[1].split('/').pop()}`
          await this.deleteImageFromStorage({ filePath: oldPath })
        }
      }

      // Crear path con estructura de carpetas por usuario
      const filePath = `user-${userId}/${fileName}`

      // Subir nueva imagen a Supabase Storage
      const { error } = await supabase.storage
        .from('mascotas-imagenes')
        .upload(filePath, file.buffer, {
          contentType: file.mimetype,
          upsert: false
        })

      if (error) throw error

      // Obtener la URL pública
      const { data: { publicUrl } } = supabase.storage
        .from('mascotas-imagenes')
        .getPublicUrl(filePath)

      // Actualizar la mascota con la nueva URL
      const updatedPet = await this.updatePet({
        id: petId,
        input: { img_url: publicUrl }
      })

      return {
        pet: updatedPet,
        imageUrl: publicUrl
      }
    } catch (error) {
      throw error
    }
  }

  static async removePetImage ({ petId }) {
    try {
      // Obtener la mascota actual
      const pet = await this.getById({ id: petId })
      if (pet.length === 0) {
        throw new Error('Pet not found')
      }

      if (!pet[0].img_url) {
        throw new Error('Pet has no image to remove')
      }

      // Extraer el path completo después del dominio
      const urlParts = pet[0].img_url.split('mascotas-imagenes/')
      if (urlParts.length > 1) {
        const filePath = `user-${pet[0].cliente_id}/${urlParts[1].split('/').pop()}`
        await this.deleteImageFromStorage({ filePath })
      }

      // Actualizar mascota (poner img_url en null)
      const updatedPet = await this.updatePet({
        id: petId,
        input: { img_url: null }
      })

      return updatedPet
    } catch (error) {
      throw error
    }
  }

  static async deleteImageFromStorage ({ filePath }) {
    try {
      const { error } = await supabase.storage
        .from('mascotas-imagenes')
        .remove([filePath])

      if (error) throw error

      return true
    } catch (error) {
      // Log del error pero no fallar completamente
      console.warn('Error deleting image from storage:', error.message)
      return false
    }
  }
}
