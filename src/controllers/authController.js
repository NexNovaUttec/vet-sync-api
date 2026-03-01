import { userModel } from '#models/userModel.js'
import { validateUser } from '#schemas/userSchema.js'
import { validateUserEmail } from '#services/userValidation.js'
import bcrypt from 'bcryptjs'
import jwt from 'jsonwebtoken'
import crypto from 'crypto'

export class AuthController {
  static async register (req, res) {
    const { data, error } = validateUser(req.body)

    if (error) {
      return res.status(422).json({ error: JSON.parse(error.message) })
    }

    const { email } = data

    try {
      const { error: emailError } = await validateUserEmail(email)

      if (emailError) return res.status(409).json({ message: emailError })

      const newUserArr = await userModel.createUser({ input: data })
      const newUser = newUserArr[0]

      const payload = {
        id: newUser.id,
        email: newUser.email,
        nombre: newUser.nombre,
        apellido: newUser.apellido,
        role: 'user'
      }

      const accessToken = jwt.sign(payload, newUser.jwt_secret, { expiresIn: '1h' })

      const refreshToken = jwt.sign({ id: newUser.id, role: 'user' }, newUser.jwt_secret, { expiresIn: '7d' })

      // Guardar el refresh token en la tabla dedicada
      await userModel.createRefreshToken({ userId: newUser.id, token: refreshToken })

      res.status(201).json({
        accessToken,
        refreshToken,
        expiresIn: '1h'
      })
    } catch (e) {
      console.error(e)
      return res.status(500).json({ message: 'Internal server error' })
    }
  }

  static async login (req, res) {
    const { email, password } = req.body

    try {
      let user = await userModel.getAllUsers({ email })
      let role = 'user'
      let model = userModel

      if (user.length === 0) {
        const { adminModel } = await import('#models/adminModel.js')
        user = await adminModel.getAdmins({ email })
        role = 'admin'
        model = adminModel
      }

      if (user.length === 0) {
        return res.status(404).json({ message: 'Email not found' })
      }

      if (!user[0].activo) {
        return res.status(401).json({ message: 'User is not active' })
      }

      const userPassword = user[0].password
      const isValidPassword = await bcrypt.compare(password, userPassword)

      if (!isValidPassword) {
        return res.status(401).json({ message: 'Invalid password' })
      }

      // Generar JWT secret único para el usuario si no existe
      let userJwtSecret = user[0].jwt_secret
      if (!userJwtSecret) {
        userJwtSecret = crypto.randomBytes(64).toString('hex')
        if (role === 'user') {
          await model.updateUserSecret({ id: user[0].id, jwt_secret: userJwtSecret })
        } else {
          await model.updateAdmin({ id: user[0].id, input: { jwt_secret: userJwtSecret } })
        }
      }

      const payload = {
        id: user[0].id,
        email: user[0].email,
        nombre: user[0].nombre,
        apellido: user[0].apellido,
        role
      }

      // Generar access token (corta duración)
      const accessToken = jwt.sign(payload, userJwtSecret, { expiresIn: '1h' })

      // Generar refresh token (larga duración)
      const refreshToken = jwt.sign({ id: user[0].id, role }, userJwtSecret, { expiresIn: '7d' })

      // Guardar refresh token en la tabla dedicada
      if (role === 'user') {
        await model.createRefreshToken({
          userId: user[0].id,
          token: refreshToken
        })
      } else {
        await model.createRefreshToken({
          adminId: user[0].id,
          token: refreshToken
        })
      }

      res.json({
        accessToken,
        refreshToken,
        expiresIn: '1h',
        role
      })
    } catch (e) {
      console.error(e)
      return res.status(500).json({ message: 'Internal server error' })
    }
  }

  static async refreshToken (req, res) {
    // Handle OPTIONS preflight request
    if (req.method === 'OPTIONS') {
      return res.status(200).end()
    }

    // For actual requests, check the method
    if (req.method !== 'POST') {
      return res.status(405).json({ message: 'Method not allowed' })
    }

    try {
      const { refreshToken } = req.body

      if (!refreshToken) {
        return res.status(400).json({ message: 'Refresh token is required' })
      }

      // Intentar buscar el refresh token primero en usuarios, luego en admins
      let tokenData = await userModel.getRefreshToken({ token: refreshToken })
      let role = 'user'
      let userData = null
      let currentModel = userModel

      if (tokenData && tokenData.usuarios) {
        userData = tokenData.usuarios
      } else {
        // Si no se encontró en usuarios, buscar en admins
        const { adminModel } = await import('#models/adminModel.js')
        tokenData = await adminModel.getRefreshToken({ token: refreshToken })
        if (tokenData && tokenData.administradores) {
          userData = tokenData.administradores
          role = 'admin'
          currentModel = adminModel
        }
      }

      if (!userData) {
        console.log('Refresh token not found in database')
        return res.status(403).json({ message: 'Invalid or expired refresh token' })
      }

      // Verify the refresh token is still valid
      try {
        jwt.verify(refreshToken, userData.jwt_secret)
      } catch (jwtError) {
        // If token is invalid, clean it up
        await currentModel.deleteRefreshToken({ token: refreshToken })
        return res.status(403).json({ message: 'Invalid or expired refresh token' })
      }

      // Verificar que el usuario/admin sigue activo
      if (!userData.activo) {
        if (role === 'user') {
          await userModel.deleteAllUserRefreshTokens({ userId: userData.id })
        } else {
          await currentModel.deleteAllAdminRefreshTokens({ adminId: userData.id })
        }
        return res.status(401).json({ message: 'User is not active' })
      }

      const payload = {
        id: userData.id,
        email: userData.email,
        nombre: userData.nombre,
        apellido: userData.apellido,
        role
      }

      // Generar nuevo access token
      const newAccessToken = jwt.sign(payload, userData.jwt_secret, { expiresIn: '1h' })

      // Generar nuevo refresh token (rotación de tokens)
      const newRefreshToken = jwt.sign({ id: userData.id, role }, userData.jwt_secret, { expiresIn: '7d' })

      // Rotar tokens: eliminar antiguo y crear nuevo
      try {
        await currentModel.deleteRefreshToken({ token: refreshToken })

        if (role === 'user') {
          await currentModel.createRefreshToken({
            userId: userData.id,
            token: newRefreshToken
          })
        } else {
          await currentModel.createRefreshToken({
            adminId: userData.id,
            token: newRefreshToken
          })
        }

        return res.json({
          accessToken: newAccessToken,
          refreshToken: newRefreshToken,
          expiresIn: '1h',
          role
        })
      } catch (dbError) {
        console.error('Error en la transacción de tokens:', dbError)
        if (dbError.message.includes('duplicate key')) {
          if (role === 'user') {
            await userModel.deleteAllUserRefreshTokens({ userId: userData.id })
            await currentModel.createRefreshToken({
              userId: userData.id,
              token: newRefreshToken
            })
          } else {
            await currentModel.deleteAllAdminRefreshTokens({ adminId: userData.id })
            await currentModel.createRefreshToken({
              adminId: userData.id,
              token: newRefreshToken
            })
          }

          return res.json({
            accessToken: newAccessToken,
            refreshToken: newRefreshToken,
            expiresIn: '1h',
            role
          })
        }
        return res.status(500).json({ message: 'Error updating session' })
      }
    } catch (error) {
      console.error('Error en el proceso de refresh token:', error)
      return res.status(500).json({ message: 'Internal server error' })
    }
  }

  static async logout (req, res) {
    const { refreshToken } = req.body

    if (!refreshToken) {
      return res.status(400).json({ message: 'Refresh token is required' })
    }

    try {
      // Intentar eliminar de ambas tablas
      const deletedFromUser = await userModel.deleteRefreshToken({ token: refreshToken })

      if (!deletedFromUser) {
        const { adminModel } = await import('#models/adminModel.js')
        await adminModel.deleteRefreshToken({ token: refreshToken })
      }

      return res.status(200).json({ message: 'Successfully logged out' })
    } catch (error) {
      console.error('Error during logout:', error)
      return res.status(500).json({ message: 'Error during logout' })
    }
  }

  static async customToken (req, res) {
    const { email, password, expiration } = req.body

    try {
      const user = await userModel.getAllUsers({ email })
      if (user.length === 0) {
        return res.status(404).json({ message: 'Email not found' })
      }

      const userPassword = user[0].password
      const isValidPassword = await bcrypt.compare(password, userPassword)

      if (!isValidPassword) {
        return res.status(401).json({ message: 'Invalid password' })
      }

      // Usar el JWT secret del usuario
      let userJwtSecret = user[0].jwt_secret
      if (!userJwtSecret) {
        userJwtSecret = crypto.randomBytes(64).toString('hex')
        await userModel.updateUserSecret({ id: user[0].id, jwt_secret: userJwtSecret })
      }

      const payload = {
        id: user[0].id,
        email: user[0].email,
        nombre: user[0].nombre
      }

      const token = jwt.sign(payload, userJwtSecret, { expiresIn: expiration })

      res.json({ token, expiration })
    } catch (error) {
      console.error(error)
      return res.status(500).json({ message: 'Internal server error' })
    }
  }
}
