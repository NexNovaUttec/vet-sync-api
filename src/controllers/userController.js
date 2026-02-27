import { validateUser, validatePartialUser } from '#schemas/userSchema.js'
import { userModel } from '#models/userModel.js'
import { validateUserEmail } from '#services/userValidation.js'

export class UserController {
  static async createUser (req, res) {
    const { data, error } = validateUser(req.body)

    if (error) {
      return res.status(422).json({ error: JSON.parse(error.message) })
    }

    const { email } = data

    try {
      const { error: emailError } = await validateUserEmail(email)

      if (emailError) return res.status(409).json({ message: emailError })

      const user = await userModel.createUser({ input: data })
      return res.status(201).json({ message: 'User created', data: user })
    } catch (error) {
      return res.status(500).json({ error: error.message })
    }
  }

  static async getAllUsers (req, res) {
    const { email } = req.query

    const users = await userModel.getAllUsers({ email })

    if (users.length === 0) {
      return res.status(404).json({ error: 'Users not found' })
    }
    res.json({ message: 'Users found', data: users })
  }

  static async getById (req, res) {
    const { id } = req.params

    const user = await userModel.getById({ id })

    if (user.length === 0) {
      return res.status(404).json({ error: 'User not found' })
    }
    res.json({ message: 'User found', data: user })
  }

  static async updateUser (req, res) {
    const { id } = req.params
    const { data, error } = validatePartialUser(req.body)

    if (error) {
      return res.status(422).json({ error: JSON.parse(error.message) })
    }

    try {
      if (data.email) {
        const { error: emailError } = await validateUserEmail(data.email, id)
        if (emailError) {
          return res.status(409).json({ message: emailError })
        }
      }

      const updatedUser = await userModel.updateUser({ id, input: data })

      if (updatedUser.length === 0) {
        return res.status(404).json({ error: 'User not found' })
      }

      res.json({ message: 'User updated', data: updatedUser })
    } catch (error) {
      return res.status(500).json({ error: error.message })
    }
  }

  static async deleteUser (req, res) {
    const { id } = req.params

    try {
      const deletedUser = await userModel.deleteUser({ id })

      if (deletedUser.length === 0) {
        return res.status(404).json({ error: 'User not found' })
      }

      res.json({ message: 'User deleted', data: deletedUser })
    } catch (error) {
      return res.status(500).json({ error: error.message })
    }
  }
}
