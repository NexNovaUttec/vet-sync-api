import { Router } from 'express'
import { CategoryController } from '#controllers/categoryController.js'

export const categoriesRouter = Router()

categoriesRouter.get('/', CategoryController.getAllCategories)

categoriesRouter.get('/:id', CategoryController.getCategoryById)
