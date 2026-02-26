import { adminModel } from '#models/adminModel.js'
import { userModel } from '#models/userModel.js'

export const validateAdminEmail = async (email, currentAdminId = null) => {
  const existingAdmin = await adminModel.getAdmins({ email })
  if (existingAdmin.length > 0 && String(existingAdmin[0].id) !== String(currentAdminId)) {
    return { error: 'Email already registered as admin' }
  }

  const existingUser = await userModel.getAllUsers({ email })
  if (existingUser.length > 0) {
    return { error: 'Email already registered as user' }
  }

  return { error: null }
}
