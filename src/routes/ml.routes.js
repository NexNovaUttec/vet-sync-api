import { Router } from 'express'
import { getNoShowRiskController, getRevenueForecastController, getDemandForecastController } from '#controllers/ml.controller.js'

export const mlRouter = Router()

mlRouter.get('/no-show-risk/:id', getNoShowRiskController)
mlRouter.get('/revenue-forecast', getRevenueForecastController)
mlRouter.get('/demand-forecast', getDemandForecastController)
