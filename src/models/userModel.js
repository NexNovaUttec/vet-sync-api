import { supabase } from '#databases/index.js'
import bcrypt from 'bcrypt'
import crypto from 'crypto'

export class userModel {
  static async createUser ({ input }) {
    const { nombre, apellido, email, password, telefono, direccion } = input
    const hashedPassword = await bcrypt.hash(password, 10)

    const jwtSecret = crypto.randomBytes(64).toString('hex')

    try {
      const { data: user, error } = await supabase.from('usuarios').insert({
        nombre,
        apellido,
        email,
        telefono,
        direccion: direccion || '',
        password: hashedPassword,
        jwt_secret: jwtSecret
      }).select()

      if (error) throw new Error(error.message)

      return user
    } catch (error) {
      throw new Error(error.message)
    }
  }

  static async getAllUsers ({ email }) {
    let query = supabase.from('usuarios').select()

    if (email) {
      query = query.eq('email', email)
    }

    const { data: users, error } = await query
    if (error) throw new Error(error.message)
    return users
  }

  static async getById ({ id }) {
    const { data: user, error } = await supabase.from('usuarios').select().eq('id', id)
    if (error) throw new Error(error.message)

    return user
  }

  static async createRefreshToken ({ userId, token }) {
    try {
      const tokenHash = crypto.createHash('sha256').update(token).digest('hex')

      // Primero verificar si el token ya existe
      const { data: existingToken } = await supabase
        .from('refresh_tokens')
        .select('id')
        .eq('token_hash', tokenHash)
        .single()

      // Si ya existe, devolver el token existente
      if (existingToken) {
        return existingToken
      }

      // Si no existe, crear uno nuevo
      const { data, error } = await supabase
        .from('refresh_tokens')
        .insert([
          {
            user_id: userId,
            token_hash: tokenHash
          }
        ])
        .select()

      if (error) {
        // Si es un error de duplicado, intentar obtener el token existente
        if (error.code === '23505') { // Código de error de violación de restricción única
          const { data: existing } = await supabase
            .from('refresh_tokens')
            .select()
            .eq('token_hash', tokenHash)
            .single()

          if (existing) return existing
        }
        throw new Error(error.message)
      }

      return data[0]
    } catch (error) {
      console.error('Error in createRefreshToken:', error.message)
      throw new Error('Error creating refresh token')
    }
  }

  static async getRefreshToken ({ token }) {
    try {
      const tokenHash = crypto.createHash('sha256').update(token).digest('hex')

      const { data, error } = await supabase
        .from('refresh_tokens')
        .select('*, usuarios(*)')
        .eq('token_hash', tokenHash)
        .single()

      if (error) {
        throw error
      }

      return data
    } catch (error) {
      console.error('Error getting refresh token:', error.message)
      return null
    }
  }

  static async deleteRefreshToken ({ token }) {
    try {
      const tokenHash = crypto.createHash('sha256').update(token).digest('hex')

      const { error } = await supabase
        .from('refresh_tokens')
        .delete()
        .eq('token_hash', tokenHash)

      if (error) {
        throw error
      }

      return true
    } catch (error) {
      console.error('Error deleting refresh token:', error.message)
      return false
    }
  }

  static async deleteAllUserRefreshTokens ({ userId }) {
    try {
      const { error } = await supabase
        .from('refresh_tokens')
        .delete()
        .eq('user_id', userId)

      if (error) {
        throw error
      }

      return true
    } catch (error) {
      console.error('Error deleting user refresh tokens:', error.message)
      return false
    }
  }

  static async updateUserSecret ({ id, jwt_secret }) {
    try {
      const { data: user, error } = await supabase
        .from('usuarios')
        .update({ jwt_secret })
        .eq('id', id)
        .select()

      if (error) throw new Error(error.message)

      return user
    } catch (error) {
      throw new Error(error.message)
    }
  }

  static async updateUser ({ id, input }) {
    const updateData = {}

    if (input.nombre) updateData.nombre = input.nombre
    if (input.apellido) updateData.apellido = input.apellido
    if (input.email) updateData.email = input.email
    if (input.telefono) updateData.telefono = input.telefono
    if (input.direccion) updateData.direccion = input.direccion

    if (input.password) {
      updateData.password = await bcrypt.hash(input.password, 10)
    }

    if (Object.keys(updateData).length === 0) {
      return await this.getById({ id })
    }

    try {
      const { data: user, error } = await supabase.from('usuarios').update(updateData).eq('id', id).select()

      if (error) throw new Error(error.message)

      return user
    } catch (error) {
      throw new Error(error.message)
    }
  }

  static async deleteUser ({ id }) {
    try {
      // Primero desactivar el usuario
      const { error } = await supabase
        .from('usuarios')
        .update({ activo: false })
        .eq('id', id)

      if (error) throw new Error(error.message)

      // Luego eliminar todos sus refresh tokens
      await this.deleteAllUserRefreshTokens({ userId: id })

      const deletedUser = await this.getById({ id })
      return deletedUser
    } catch (error) {
      throw new Error(error.message)
    }
  }
}
