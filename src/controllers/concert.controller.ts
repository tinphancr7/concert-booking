import { Request, Response } from 'express'
import { Concert } from '../models/concert.model.js'
import redis from '~/config/redis.js'

// GET /api/concerts
export const getAllConcerts = async (_: Request, res: Response) => {
  const concerts = await Concert.find()
  res.json(concerts)
}

// GET /api/concerts/:id
export const getConcertById = async (req: Request, res: Response) => {
  const concert = await Concert.findById(req.params.id)
  if (!concert) return res.status(404).json({ message: 'Concert not found' })
  res.json(concert)
}

// POST /api/concerts

export const createConcert = async (req: Request, res: Response) => {
  try {
    const concert = await Concert.create(req.body)

    // Save new seat counts to Redis
    for (const seat of concert.seatTypes) {
      const key = `concert:${concert._id.toString()}:seat:${seat.type}`
      await redis.set(key, seat.remaining)
    }

    res.status(201).json(concert)
  } catch (err) {
    res.status(400).json({ message: 'Failed to create concert', error: err })
  }
}

// PUT /api/concerts/:id
export const updateConcert = async (req: Request, res: Response) => {
  const updated = await Concert.findByIdAndUpdate(req.params.id, req.body, { new: true })
  if (!updated) return res.status(404).json({ message: 'Concert not found' })

  // Update Redis seat counts
  for (const seat of updated.seatTypes) {
    const key = `concert:${updated._id.toString()}:seat:${seat.type}`
    await redis.set(key, seat.remaining)
  }
  res.json(updated)
}

// DELETE /api/concerts/:id
export const deleteConcert = async (req: Request, res: Response) => {
  const concert = await Concert.findByIdAndDelete(req.params.id)
  if (!concert) return res.status(404).json({ message: 'Concert not found' })

  // Remove related Redis keys
  for (const seat of concert.seatTypes) {
    const redisKey = `concert:${concert._id.toString()}:seat:${seat.type}`
    const userKeys = await redis.keys(`concert:${concert._id.toString()}:user:*`)
    await redis.del(redisKey, ...userKeys)
  }

  res.json({ message: 'Concert and Redis keys deleted' })
}
