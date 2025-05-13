import { Request, Response, NextFunction } from 'express'
import jwt from 'jsonwebtoken'

export interface AuthRequest extends Request {
  userId?: string
}

export function requireAuth(req: AuthRequest, res: Response, next: NextFunction) {
  const auth = req.headers.authorization

  if (!auth?.startsWith('Bearer ')) return res.status(401).json({ message: 'Unauthorized' })

  try {
    const token = auth.split(' ')[1]
    console.log('Token:', token)
    const payload = jwt.verify(token, process.env.JWT_SECRET!) as { userId: string }
    console.log('Decoded payload:', payload)
    req.userId = payload.userId
    console.log('Decoded userId:', req.userId)
    next()
  } catch (error) {
    console.error('Error verifying token:', error)
    return res.status(401).json({ message: 'Invalid token' })
  }
}
