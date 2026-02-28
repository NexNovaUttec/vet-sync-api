import { Router } from 'express'
import { ScheduleController } from '#controllers/scheduleController.js'
import { requireAdmin } from '#middlewares/auth.js'

export const scheduleRouter = Router()

scheduleRouter.post('/', requireAdmin, ScheduleController.addSchedule)

scheduleRouter.get('/', ScheduleController.getAllSchedules)
scheduleRouter.get('/:id', ScheduleController.getById)

scheduleRouter.patch('/:id', requireAdmin, ScheduleController.updateSchedule)
scheduleRouter.delete('/:id', requireAdmin, ScheduleController.deleteSchedule)
