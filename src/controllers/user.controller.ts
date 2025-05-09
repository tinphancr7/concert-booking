// src/controllers/user.controller.ts
import { Request, Response } from 'express'
import { User } from '../models/user.model.js'

export const getAllUsers = async (_: Request, res: Response) => {
  const users = await User.find()
  res.json(users)
}

export const getUserById = async (req: Request, res: Response) => {
  const user = await User.findById(req.params.id)
  if (!user) return res.status(404).json({ message: 'User not found' })
  res.json(user)
}

export const updateUser = async (req: Request, res: Response) => {
  const updated = await User.findByIdAndUpdate(req.params.id, req.body, { new: true })
  if (!updated) return res.status(404).json({ message: 'User not found' })
  res.json(updated)
}

export const deleteUser = async (req: Request, res: Response) => {
  const deleted = await User.findByIdAndDelete(req.params.id)
  if (!deleted) return res.status(404).json({ message: 'User not found' })
  res.json({ message: 'User deleted' })
}
