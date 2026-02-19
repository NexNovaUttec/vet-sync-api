import { jest } from '@jest/globals'
import { AuthController } from '../src/controllers/authController.js'
import { userModel } from '../src/models/userModel.js'
import bcrypt from 'bcrypt'
import jwt from 'jsonwebtoken'

beforeEach(() => {
  jest.restoreAllMocks()
  jest.spyOn(userModel, 'getAllUsers').mockReset()
  jest.spyOn(userModel, 'createUser').mockReset()
  jest.spyOn(userModel, 'createRefreshToken').mockReset()
  jest.spyOn(userModel, 'updateUserSecret').mockReset()
  jest.spyOn(userModel, 'getRefreshToken').mockReset()
  jest.spyOn(userModel, 'deleteRefreshToken').mockReset()
  jest.spyOn(userModel, 'deleteAllUserRefreshTokens').mockReset()
  jest.spyOn(bcrypt, 'compare').mockReset()
  jest.spyOn(jwt, 'sign').mockReset()
})

describe('AuthController', () => {
  let req, res

  beforeEach(() => {
    req = { body: {} }
    res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn().mockReturnThis(),
      end: jest.fn().mockReturnThis()
    }
    jest.clearAllMocks()
  })

  test('register: should return 409 if email already registered', async () => {
    req.body = {
      email: 'text@gmail.com',
      password: '1234567890',
      nombre: 'Juan Daniel ',
      apellido: 'Alvarado Pelcastre',
      telefono: '1234567890',
      direcion: 'av. iaiiaaiiaiaia 123',
      rol: 'user',
      activo: true
    }
    userModel.getAllUsers.mockResolvedValue([{
      id: 1,
      email: 'text@gmail.com',
      nombre: 'Juan Daniel ',
      apellido: 'Alvarado Pelcastre',
      telefono: '1234567890',
      direcion: 'av. iaiiaaiiaiaia 123',
      rol: 'user',
      activo: true
    }])
    await AuthController.register(req, res)
    expect(res.status).toHaveBeenCalledWith(409)
    expect(res.json).toHaveBeenCalledWith({ message: 'Email already registered' })
  })

  test('login: should return 404 if email not found', async () => {
    req.body = { email: 'notfound@mail.com', password: '123' }
    userModel.getAllUsers.mockResolvedValue([])
    await AuthController.login(req, res)
    expect(res.status).toHaveBeenCalledWith(404)
    expect(res.json).toHaveBeenCalledWith({ message: 'Email not found' })
  })

  test('login: should return 401 if user is not active', async () => {
    req.body = { email: 'inactive@mail.com', password: '123' }
    userModel.getAllUsers.mockResolvedValue([{ activo: false }])
    await AuthController.login(req, res)
    expect(res.status).toHaveBeenCalledWith(401)
    expect(res.json).toHaveBeenCalledWith({ message: 'User is not active' })
  })

  test('login: should return 401 if password is invalid', async () => {
    req.body = { email: 'test@mail.com', password: 'wrong' }
    userModel.getAllUsers.mockResolvedValue([{ activo: true, password: 'hash' }])
    bcrypt.compare.mockResolvedValue(false)
    await AuthController.login(req, res)
    expect(res.status).toHaveBeenCalledWith(401)
    expect(res.json).toHaveBeenCalledWith({ message: 'Invalid password' })
  })

  test('login: should return tokens if credentials are valid', async () => {
    req.body = { email: 'test@mail.com', password: 'right' }
    const user = { id: 1, email: 'test@mail.com', nombre: 'Test', apellido: 'User', activo: true, password: 'hash', jwt_secret: 'secret' }
    userModel.getAllUsers.mockResolvedValue([user])
    bcrypt.compare.mockResolvedValue(true)
    jwt.sign.mockReturnValueOnce('accessToken').mockReturnValueOnce('refreshToken')
    userModel.createRefreshToken.mockResolvedValue()
    await AuthController.login(req, res)
    expect(res.json).toHaveBeenCalledWith({ accessToken: 'accessToken', refreshToken: 'refreshToken', expiresIn: '1h' })
  })
})
