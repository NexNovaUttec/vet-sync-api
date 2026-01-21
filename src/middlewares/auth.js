import jwt from 'jsonwebtoken'
import { userModel } from '#models/userModel.js'

export const authenticateToken = async (req, res, next) => {
  const token = req.headers.authorization?.split(' ')[1] || req.headers.token

  if (!token) {
    return res.status(401).json({ message: 'Access token not provided' })
  }

  try {
    const decoded = jwt.decode(token)

    if (!decoded || !decoded.id) {
      return res.status(403).json({ message: 'Invalid token format' })
    }

    const user = await userModel.getById({ id: decoded.id })

    if (user.length === 0) {
      return res.status(403).json({ message: 'User not found' })
    }

    const userData = user[0]

    if (!userData.activo) {
      return res.status(401).json({ message: 'User is not active' })
    }

    if (!userData.jwt_secret) {
      return res.status(403).json({ message: 'User JWT secret not found' })
    }

    jwt.verify(token, userData.jwt_secret, (err, userPayload) => {
      if (err) {
        console.error('JWT verification error:', err.message)

        if (err.name === 'TokenExpiredError') {
          return res.status(401).json({
            message: 'Access token expired',
            code: 'TOKEN_EXPIRED'
          })
        }

        return res.status(403).json({ message: 'Invalid token' })
      }

      req.user = userPayload
      next()
    })
  } catch (error) {
    console.error('Authentication error:', error.message)
    return res.status(500).json({ message: 'Authentication failed' })
  }
}
