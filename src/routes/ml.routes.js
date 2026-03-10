import { Router } from 'express'
import { getNoShowRiskController } from '#controllers/ml.controller.js'

export const mlRouter = Router()

mlRouter.get('/no-show-risk/:id', getNoShowRiskController)
