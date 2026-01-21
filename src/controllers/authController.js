import { userModel } from '#models/userModel.js'
import { validateUser } from '#schemas/userSchema.js'
import bcrypt from 'bcrypt'
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
      const existingUser = await userModel.getAllUsers({ email })
      if (existingUser.length > 0) {
        return res.status(409).json({ message: 'Email already registered' })
      }

      const newUserArr = await userModel.createUser({ input: data })
      const newUser = newUserArr[0]

      const payload = {
        id: newUser.id,
        email: newUser.email,
        nombre: newUser.nombre,
        apellido: newUser.apellido
      }

      const accessToken = jwt.sign(
        payload,
        newUser.jwt_secret,
        { expiresIn: '1h' }
      )

      const refreshToken = jwt.sign(
        { id: newUser.id },
        newUser.jwt_secret,
        { expiresIn: '7d' }
      )

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
      const user = await userModel.getAllUsers({ email })

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
        await userModel.updateUserSecret({ id: user[0].id, jwt_secret: userJwtSecret })
      }

      const payload = {
        id: user[0].id,
        email: user[0].email,
        nombre: user[0].nombre,
        apellido: user[0].apellido
      }

      // Generar access token (corta duración)
      const accessToken = jwt.sign(
        payload,
        userJwtSecret,
        { expiresIn: '1h' }
      )

      // Generar refresh token (larga duración)
      const refreshToken = jwt.sign(
        { id: user[0].id },
        userJwtSecret,
        { expiresIn: '7d' }
      )

      // Guardar refresh token en la tabla dedicada
      await userModel.createRefreshToken({
        userId: user[0].id,
        token: refreshToken
      })

      res.json({
        accessToken,
        refreshToken,
        expiresIn: '1h'
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

      try {
        // Get refresh token with user data
        const tokenData = await userModel.getRefreshToken({ token: refreshToken })

        if (!tokenData || !tokenData.usuarios) {
          console.log('Refresh token not found in database')
          return res.status(403).json({ message: 'Invalid or expired refresh token' })
        }

        const userData = tokenData.usuarios

        // Verify the refresh token is still valid
        try {
          jwt.verify(refreshToken, userData.jwt_secret)
        } catch (jwtError) {
          // If token is invalid, clean it up
          await userModel.deleteRefreshToken({ token: refreshToken })
          return res.status(403).json({ message: 'Invalid or expired refresh token' })
        }

        // Verificar que el usuario sigue activo
        if (!userData.activo) {
          // Eliminar todos los tokens del usuario inactivo
          await userModel.deleteAllUserRefreshTokens({ userId: userData.id })
          return res.status(401).json({ message: 'User is not active' })
        }

        const payload = {
          id: userData.id,
          email: userData.email,
          nombre: userData.nombre,
          apellido: userData.apellido
        }

        // Generar nuevo access token
        const newAccessToken = jwt.sign(
          payload,
          userData.jwt_secret,
          { expiresIn: '1h' }
        )

        // Generar nuevo refresh token (rotación de tokens)
        const newRefreshToken = jwt.sign(
          { id: userData.id },
          userData.jwt_secret,
          { expiresIn: '7d' }
        )

        // Usar transacción para evitar condiciones de carrera
        try {
          // Primero eliminar el token antiguo
          await userModel.deleteRefreshToken({ token: refreshToken })

          // Luego crear el nuevo token
          await userModel.createRefreshToken({
            userId: userData.id,
            token: newRefreshToken
          })

          return res.json({
            accessToken: newAccessToken,
            refreshToken: newRefreshToken,
            expiresIn: '1h'
          })
        } catch (dbError) {
          console.error('Error en la transacción de tokens:', dbError)
          // Si hay un error, intentar limpiar tokens duplicados
          if (dbError.message.includes('duplicate key')) {
            // Eliminar tokens duplicados y devolver el más reciente
            await userModel.deleteAllUserRefreshTokens({ userId: userData.id })
            await userModel.createRefreshToken({
              userId: userData.id,
              token: newRefreshToken
            })

            return res.json({
              accessToken: newAccessToken,
              refreshToken: newRefreshToken,
              expiresIn: '1h'
            })
          }
          return res.status(500).json({ message: 'Error updating session' })
        }
      } catch (jwtError) {
        console.error('Error verifying refresh token:', jwtError.message)
        // Eliminar el token inválido
        await userModel.deleteRefreshToken({ token: refreshToken })
        return res.status(403).json({ message: 'Invalid or expired refresh token' })
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
      await userModel.deleteRefreshToken({ token: refreshToken })
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

      const token = jwt.sign(
        payload,
        userJwtSecret,
        { expiresIn: expiration }
      )

      res.json({ token, expiration })
    } catch (error) {
      console.error(error)
      return res.status(500).json({ message: 'Internal server error' })
    }
  }
}
