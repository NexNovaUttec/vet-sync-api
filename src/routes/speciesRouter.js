import { Router } from 'express'
import { SpeciesController } from '#controllers/speciesController.js'

export const speciesRouter = Router()

speciesRouter.get('/', SpeciesController.getAllSpecies)

speciesRouter.get('/:id', SpeciesController.getById)

speciesRouter.get('/name/:name', SpeciesController.getByName)
