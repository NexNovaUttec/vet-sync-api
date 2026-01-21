import { Router } from 'express'
import { AuthController } from '#controllers/authController.js'
import { authenticateToken } from '#middlewares/auth.js'

export const authRouter = Router()

authRouter.post('/register', AuthController.register)
authRouter.post('/login', AuthController.login)

authRouter.post('/refresh', AuthController.refreshToken)
authRouter.post('/token', AuthController.customToken)

authRouter.post('/logout', authenticateToken, AuthController.logout)
