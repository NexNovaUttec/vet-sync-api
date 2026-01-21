import { Router } from 'express'
import { VetController } from '#controllers/vetController.js'

export const vetRouter = Router()

vetRouter.post('/', VetController.addVet)

vetRouter.get('/', VetController.getAllVets)
vetRouter.get('/:id', VetController.getById)

vetRouter.patch('/:id', VetController.updateVet)
vetRouter.delete('/:id', VetController.deleteVet)
