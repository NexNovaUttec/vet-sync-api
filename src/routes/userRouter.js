import { Router } from 'express'
import { authenticateToken } from '#middlewares/auth.js'
import { UserController } from '#controllers/userController.js'

export const userRouter = Router()

userRouter.post('/', UserController.createUser)

userRouter.use(authenticateToken)

userRouter.get('/', UserController.getAllUsers)
userRouter.get('/:id', UserController.getById)

userRouter.patch('/:id', UserController.updateUser)
userRouter.delete('/:id', UserController.deleteUser)
