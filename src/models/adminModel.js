import { supabase } from '../database/index.js'
import bcrypt from 'bcryptjs'
import crypto from 'crypto'

export class adminModel {
  static async createAdmin ({ input }) {
    const { password } = input
    const hashedPassword = await bcrypt.hash(password, 10)

    const jwtSecret = crypto.randomBytes(64).toString('hex')

    try {
      const { data: admin, error } = await supabase
        .from('administradores')
        .insert({
          ...input,
          password: hashedPassword,
          jwt_secret: jwtSecret
        })
        .select()

      if (error) throw new Error(error.message)

      return admin
    } catch (error) {
      throw new Error(error.message)
    }
  }

  static async getAdmins ({ email }) {
    let query = supabase.from('administradores').select('*')

    if (email) {
      query = query.eq('email', email)
    }
    const { data: admins, error } = await query

    if (error) throw new Error(error.message)

    return admins
  }

  static async getById ({ id }) {
    const { data: admin, error } = await supabase.from('administradores').select('*').eq('id', id)
    if (error) throw new Error(error.message)

    return admin
  }

  static async updateAdmin ({ id, input }) {
    try {
      const { data: updatedAdmin, error } = await supabase.from('administradores').update(input).eq('id', id).select()

      if (error) throw new Error(error.message)
      return updatedAdmin
    } catch (error) {
      throw new Error(error.message)
    }
  }

  static async deleteAdmin ({ id }) {
    try {
      const { error } = await supabase.from('administradores').update({ activo: false }).eq('id', id)

      if (error) throw new Error(error.message)

      await this.deleteAllAdminRefreshTokens({ userId: id })

      const deletedAdmin = await this.getById({ id })
      return deletedAdmin
    } catch (error) {
      throw new Error(error.message)
    }
  }

  static async deleteAllAdminRefreshTokens ({ userId }) {
    try {
      const { error } = await supabase.from('admin_refresh_tokens').delete().eq('user_id', userId)

      if (error) {
        throw error
      }

      return true
    } catch (error) {
      console.error('Error deleting admin refresh tokens:', error.message)
      return false
    }
  }
}
