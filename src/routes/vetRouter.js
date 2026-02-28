import { Router } from 'express'
import { VetController } from '#controllers/vetController.js'
import { requireAdmin } from '#middlewares/auth.js'

export const vetRouter = Router()

vetRouter.post('/', requireAdmin, VetController.addVet)

vetRouter.get('/', VetController.getAllVets)
vetRouter.get('/:id', VetController.getById)

vetRouter.patch('/:id', requireAdmin, VetController.updateVet)
vetRouter.delete('/:id', requireAdmin, VetController.deleteVet)
