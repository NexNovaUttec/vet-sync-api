import { supabase } from '#databases/index.js'

export class serviceModel {
  static async getAllServices ({ categoria_id }) {
    let query = supabase.from('servicios').select()

    if (categoria_id) {
      query = query.eq('categoria_id', categoria_id)
    }

    try {
      const { data: services, error } = await query

      if (error) throw error

      return services
    } catch (error) {
      throw error
    }
  }

  static async getById ({ id }) {
    try {
      const { data: service, error } = await supabase.from('servicios').select().eq('id', id)

      if (error) throw error

      return service
    } catch (error) {
      throw error
    }
  }

  static async getActiveServices ({ active }) {
    try {
      const { data: services, error } = await supabase
        .from('servicios')
        .select()
        .eq('activo', active)
        .order('id', { ascending: true })

      if (error) throw error

      return services
    } catch (error) {
      throw error
    }
  }

  static async addService ({ input }) {
    try {
      const { data: service, error } = await supabase.from('servicios').insert([input]).select()

      if (error) throw error

      return service
    } catch (error) {
      throw error
    }
  }

  static async updateService ({ id, input }) {
    const updateData = {}

    if (input.nombre) updateData.nombre = input.nombre
    if (input.descripcion) updateData.descripcion = input.descripcion
    if (input.precio) updateData.precio = input.precio
    if (input.duracion_estimada) updateData.duracion_estimada = input.duracion_estimada
    if (input.categoria_id) updateData.categoria_id = input.categoria_id
    if (input.img_url !== undefined) updateData.img_url = input.img_url // Permite null para eliminar imagen

    if (Object.keys(updateData).length === 0) {
      return await this.getById({ id })
    }

    try {
      const { data: service, error } = await supabase.from('servicios').update(updateData).eq('id', id).select()

      if (error) throw error

      return service
    } catch (error) {
      throw error
    }
  }

  static async deleteService ({ id }) {
    try {
      const { data: service, error } = await supabase.from('servicios')
        .update({ activo: false }).eq('id', id).select()

      if (error) throw error

      return service
    } catch (error) {
      throw error
    }
  }

  static async uploadServiceImage ({ serviceId, file, fileName }) {
    try {
      // Primero verificar que el servicio existe
      const service = await this.getById({ id: serviceId })
      if (service.length === 0) {
        throw new Error('Service not found')
      }

      // Si el servicio ya tiene una imagen, eliminarla primero
      if (service[0].img_url) {
        const oldFileName = service[0].img_url.split('/').pop()
        await this.deleteImageFromStorage({ fileName: oldFileName })
      }

      // Subir nueva imagen a Supabase Storage
      const { error } = await supabase.storage
        .from('servicios-imagenes')
        .upload(fileName, file.buffer, {
          contentType: file.mimetype,
          upsert: false
        })

      if (error) throw error

      // Obtener la URL pública
      const { data: { publicUrl } } = supabase.storage
        .from('servicios-imagenes')
        .getPublicUrl(fileName)

      // Actualizar el servicio con la nueva URL
      const updatedService = await this.updateService({
        id: serviceId,
        input: { img_url: publicUrl }
      })

      return {
        service: updatedService,
        imageUrl: publicUrl
      }
    } catch (error) {
      throw error
    }
  }

  static async removeServiceImage ({ serviceId }) {
    try {
      // Obtener el servicio actual
      const service = await this.getById({ id: serviceId })
      if (service.length === 0) {
        throw new Error('Service not found')
      }

      if (!service[0].img_url) {
        throw new Error('Service has no image to remove')
      }

      // Extraer nombre del archivo de la URL
      const fileName = service[0].img_url.split('/').pop()

      // Eliminar de Storage
      await this.deleteImageFromStorage({ fileName })

      // Actualizar servicio (poner img_url en null)
      const updatedService = await this.updateService({
        id: serviceId,
        input: { img_url: null }
      })

      return updatedService
    } catch (error) {
      throw error
    }
  }

  static async deleteImageFromStorage ({ fileName }) {
    try {
      const { error } = await supabase.storage
        .from('servicios-imagenes')
        .remove([fileName])

      if (error) throw error

      return true
    } catch (error) {
      // Log del error pero no fallar completamente
      console.warn('Error deleting image from storage:', error.message)
      return false
    }
  }

  static async getBlockedSlots ({ servicio_id, fecha }) {
    try {
      const { data: blockedSlots, error } = await supabase
        .rpc('get_blocked_slots_for_day', {
          p_servicio_id: parseInt(servicio_id),
          p_fecha: fecha
        })

      if (error) throw error

      return blockedSlots || []
    } catch (error) {
      throw error
    }
  }
}
