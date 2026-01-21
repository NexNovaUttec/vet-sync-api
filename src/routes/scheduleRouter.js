import { Router } from 'express'
import { ScheduleController } from '#controllers/scheduleController.js'

export const scheduleRouter = Router()

scheduleRouter.post('/', ScheduleController.addSchedule)

scheduleRouter.get('/', ScheduleController.getAllSchedules)
scheduleRouter.get('/:id', ScheduleController.getById)

scheduleRouter.patch('/:id', ScheduleController.updateSchedule)
scheduleRouter.delete('/:id', ScheduleController.deleteSchedule)
