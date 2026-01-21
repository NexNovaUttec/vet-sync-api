import { serviceModel } from '#models/serviceModel.js'

export class ServiceImageController {
  static async uploadImage (req, res) {
    const { id } = req.params

    try {
      // Verificar que se subió un archivo
      if (!req.file) {
        return res.status(400).json({ error: 'No image file provided' })
      }

      // Crear nombre único para el archivo
      const fileName = `servicio-${id}-${Date.now()}-${req.file.originalname}`

      // Subir imagen y actualizar servicio
      const result = await serviceModel.uploadServiceImage({
        serviceId: id,
        file: req.file,
        fileName
      })

      res.status(200).json({
        message: 'Image uploaded successfully',
        data: {
          service: result.service,
          imageUrl: result.imageUrl
        }
      })
    } catch (error) {
      if (error.message === 'Service not found') {
        return res.status(404).json({ error: 'Service not found' })
      }

      return res.status(500).json({ error: error.message })
    }
  }

  static async removeImage (req, res) {
    const { id } = req.params

    try {
      const updatedService = await serviceModel.removeServiceImage({ serviceId: id })

      res.status(200).json({
        message: 'Image removed successfully',
        data: updatedService
      })
    } catch (error) {
      if (error.message === 'Service not found') {
        return res.status(404).json({ error: 'Service not found' })
      }

      if (error.message === 'Service has no image to remove') {
        return res.status(400).json({ error: 'Service has no image to remove' })
      }

      return res.status(500).json({ error: error.message })
    }
  }

  static async getImageInfo (req, res) {
    const { id } = req.params

    try {
      const service = await serviceModel.getById({ id })

      if (service.length === 0) {
        return res.status(404).json({ error: 'Service not found' })
      }

      const imageInfo = {
        hasImage: !!service[0].img_url,
        imageUrl: service[0].img_url || null,
        serviceName: service[0].nombre
      }

      res.status(200).json({
        message: 'Image info retrieved',
        data: imageInfo
      })
    } catch (error) {
      return res.status(500).json({ error: error.message })
    }
  }
}
