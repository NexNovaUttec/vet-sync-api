import { Router } from 'express'
import { BreedsController } from '#controllers/breedsController.js'

export const breedsRouter = Router()

breedsRouter.get('/', BreedsController.getAllBreeds)

breedsRouter.get('/:id', BreedsController.getById)

breedsRouter.get('/name/:name', BreedsController.getByName)

breedsRouter.get('/species/:speciesId', BreedsController.getBySpecies)
