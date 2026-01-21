import { Router } from 'express'
import { PetController } from '#controllers/petController.js'
import { PetImageController } from '#controllers/petImageController.js'
import { imageMiddleware } from '../middlewares/multer.js'

export const petRouter = Router()

petRouter.get('/', PetController.getAllPets)
petRouter.get('/detail', PetController.getDetailedPet)
petRouter.get('/user/:userId', PetController.getByUser)
petRouter.get('/:id', PetController.getById)

petRouter.post('/', PetController.addPet)
petRouter.patch('/:id', PetController.updatePet)
petRouter.delete('/:id', PetController.deletePet)

petRouter.post('/:id/imagen', imageMiddleware, PetImageController.uploadImage)
petRouter.delete('/:id/imagen', PetImageController.removeImage)
petRouter.get('/:id/imagen', PetImageController.getImageInfo)
