import { Router } from 'express'
import { authenticateToken, requireAdmin } from '#middlewares/auth.js'
import { AdminController } from '#controllers/adminController.js'
import { AdminStatsController } from '#controllers/adminStatsController.js'

export const adminRouter = Router()

adminRouter.post('/', AdminController.createAdmin)

adminRouter.use(authenticateToken)
adminRouter.use(requireAdmin)

adminRouter.get('/', AdminController.getAdmins)
adminRouter.get('/stats', AdminStatsController.getStats)
adminRouter.get('/:id', AdminController.getById)

adminRouter.patch('/:id', AdminController.updateAdmin)
adminRouter.delete('/:id', AdminController.deleteAdmin)
