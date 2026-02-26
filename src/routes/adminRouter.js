import { Router } from 'express'
import { authenticateToken } from '#middlewares/auth.js'
import { AdminController } from '#controllers/adminController.js'

export const adminRouter = Router()

adminRouter.post('/', AdminController.createAdmin)

adminRouter.use(authenticateToken)

adminRouter.get('/', AdminController.getAdmins)
adminRouter.get('/:id', AdminController.getById)

adminRouter.patch('/:id', AdminController.updateAdmin)
adminRouter.delete('/:id', AdminController.deleteAdmin)
