import { Request, Response } from 'express'
import { hashPassword, comparePassword, generateToken } from '../utils/auth.js'
import { User } from '~/models/user.model.js'

export const register = async (req: Request, res: Response) => {
  const { email, password } = req.body

  const existing = await User.findOne({ email })
  if (existing) return res.status(409).json({ message: 'Email already used' })

  const passwordHash = await hashPassword(password)
  const user = await User.create({ email, passwordHash })

  const token = generateToken(user._id.toString())
  res.json({ token })
}

export const login = async (req: Request, res: Response) => {
  const { email, password } = req.body

  const user = await User.findOne({ email })
  if (!user) return res.status(401).json({ message: 'Invalid credentials' })

  const valid = await comparePassword(password, user.passwordHash)
  if (!valid) return res.status(401).json({ message: 'Invalid credentials' })

  const token = generateToken(user._id.toString())
  res.json({ token })
}
