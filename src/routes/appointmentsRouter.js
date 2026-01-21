import { Router } from 'express'
import { AppointmentController } from '#controllers/appointmentController.js'

export const appointmentsRouter = Router()

appointmentsRouter.get('/', AppointmentController.getAllAppointments)
appointmentsRouter.get('/id/:id', AppointmentController.getById)
appointmentsRouter.get('/detailed', AppointmentController.getDetailedAppointments)
appointmentsRouter.get('/detailed/:id', AppointmentController.getDetailedAppointment)

appointmentsRouter.post('/', AppointmentController.addAppointment)

appointmentsRouter.patch('/:id', AppointmentController.updateAppointment)
appointmentsRouter.delete('/:id', AppointmentController.deleteAppointment)
