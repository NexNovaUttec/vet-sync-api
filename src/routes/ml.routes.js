import { Router } from 'express'
import { getNoShowRiskController, getRevenueForecastController } from '#controllers/ml.controller.js'

export const mlRouter = Router()

mlRouter.get('/no-show-risk/:id', getNoShowRiskController)
mlRouter.get('/revenue-forecast', getRevenueForecastController)
