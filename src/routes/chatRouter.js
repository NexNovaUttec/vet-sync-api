import { Router } from 'express'
import { ChatController } from '#controllers/chatController.js'

export const chatRouter = Router()

chatRouter.post('/message', ChatController.sendMessage)
