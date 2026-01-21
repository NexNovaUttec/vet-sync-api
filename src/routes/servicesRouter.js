import { Router } from 'express'
import { ServiceController } from '#controllers/serviceController.js'
import { authenticateToken } from '#middlewares/auth.js'
import { ServiceImageController } from '#controllers/serviceImageController.js'
import { imageMiddleware } from '../middlewares/multer.js'

export const servicesRouter = Router()

servicesRouter.get('/', ServiceController.getAllServices)
servicesRouter.get('/:id', ServiceController.getById)
servicesRouter.get('/:id/blocked-slots', ServiceController.getBlockedSlots)
servicesRouter.get('/active/:active', ServiceController.getActiveServices)

servicesRouter.use(authenticateToken)

servicesRouter.post('/', ServiceController.addService)

servicesRouter.patch('/:id', ServiceController.updateService)
servicesRouter.delete('/:id', ServiceController.deleteService)

servicesRouter.post('/:id/imagen', imageMiddleware, ServiceImageController.uploadImage)
servicesRouter.delete('/:id/imagen', ServiceImageController.removeImage)
servicesRouter.get('/:id/imagen', ServiceImageController.getImageInfo)
