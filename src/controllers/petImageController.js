import { petModel } from '#models/petModel.js'

export class PetImageController {
  static async uploadImage (req, res) {
    const { id } = req.params
    const userId = req.user.id // El token JWT ya nos provee el ID del usuario

    try {
      // Verificar que se subió un archivo
      if (!req.file) {
        return res.status(400).json({ error: 'No image file provided' })
      }

      // Crear nombre único para el archivo
      const fileName = `mascota-${id}-${Date.now()}-${req.file.originalname}`

      // Subir imagen y actualizar mascota
      const result = await petModel.uploadPetImage({
        petId: id,
        userId,
        file: req.file,
        fileName
      })

      res.status(200).json({
        message: 'Image uploaded successfully',
        data: {
          pet: result.pet,
          imageUrl: result.imageUrl
        }
      })
    } catch (error) {
      if (error.message === 'Pet not found') {
        return res.status(404).json({ error: 'Pet not found' })
      }

      return res.status(500).json({ error: error.message })
    }
  }

  static async removeImage (req, res) {
    const { id } = req.params

    try {
      const updatedPet = await petModel.removePetImage({ petId: id })

      res.status(200).json({
        message: 'Image removed successfully',
        data: updatedPet
      })
    } catch (error) {
      if (error.message === 'Pet not found') {
        return res.status(404).json({ error: 'Pet not found' })
      }

      if (error.message === 'Pet has no image to remove') {
        return res.status(400).json({ error: 'Pet has no image to remove' })
      }

      return res.status(500).json({ error: error.message })
    }
  }

  static async getImageInfo (req, res) {
    const { id } = req.params

    try {
      const pet = await petModel.getById({ id })

      if (pet.length === 0) {
        return res.status(404).json({ error: 'Pet not found' })
      }

      const imageInfo = {
        hasImage: !!pet[0].img_url,
        imageUrl: pet[0].img_url || null,
        petName: pet[0].nombre
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
