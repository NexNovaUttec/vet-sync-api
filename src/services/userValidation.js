import { userModel } from '#models/userModel.js'
import { adminModel } from '#models/adminModel.js'

export const validateUserEmail = async (email, currentUserId = null) => {
  const existingUser = await userModel.getAllUsers({ email })
  if (existingUser.length > 0 && String(existingUser[0].id) !== String(currentUserId)) {
    return { error: 'Email already registered as user' }
  }

  const existingAdmin = await adminModel.getAdmins({ email })
  if (existingAdmin.length > 0) {
    return { error: 'Email already registered as admin' }
  }

  return { error: null }
}
