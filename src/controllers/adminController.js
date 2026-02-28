import { validateAdmin, validatePartialAdmin } from '../schemas/adminSchema.js'
import { adminModel } from '../models/adminModel.js'
import { validateAdminEmail } from '../services/adminValidation.js'

export class AdminController {
  static async createAdmin (req, res) {
    const { data, error } = validateAdmin(req.body)

    if (error) return res.status(400).json({ error: error.flatten() })

    const { email } = data

    try {
      const { error: emailError } = await validateAdminEmail(email)

      if (emailError) return res.status(409).json({ message: emailError })

      const admin = await adminModel.createAdmin({ input: data })
      return res.status(201).json({ message: 'Admin created', data: admin })
    } catch (error) {
      return res.status(500).json({ error: error.message })
    }
  }

  static async getAdmins (req, res) {
    const { email } = req.query

    const admins = await adminModel.getAdmins({ email })
    if (admins.length === 0) return res.status(404).json({ error: 'Admins not found' })

    res.json({ data: admins })
  }

  static async getById (req, res) {
    const { id } = req.params
    const admin = await adminModel.getById({ id })

    if (admin.length === 0) return res.status(404).json({ error: 'Admin not found' })

    res.json({ message: 'Admin found', data: admin })
  }

  static async updateAdmin (req, res) {
    const { id } = req.params
    const { data, error } = validatePartialAdmin(req.body)

    if (error) return res.status(400).json({ error: error.flatten() })

    try {
      if (data.email) {
        const { error: emailError } = await validateAdminEmail(data.email, id)
        if (emailError) {
          return res.status(409).json({ message: emailError })
        }
      }

      const admin = await adminModel.updateAdmin({ id, input: data })
      return res.json({ message: 'Admin updated', data: admin })
    } catch (error) {
      return res.status(500).json({ error: error.message })
    }
  }

  static async deleteAdmin (req, res) {
    const { id } = req.params

    try {
      const deletedAdmin = await adminModel.deleteAdmin({ id })
      return res.json({ message: 'Admin deleted', data: deletedAdmin })
    } catch (error) {
      return res.status(500).json({ error: error.message })
    }
  }
}
