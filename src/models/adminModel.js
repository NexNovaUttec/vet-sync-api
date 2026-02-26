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
}
