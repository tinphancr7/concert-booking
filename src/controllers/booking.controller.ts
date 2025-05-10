import { Request, Response } from 'express'
import { attemptBooking } from '../services/booking.service.js'
import { AuthRequest } from '../utils/requireAuth.js'
import { Booking } from '~/models/booking.model.js'
import redis from '~/config/redis.js'
import { Concert } from '~/models/concert.model.js'
import { emailQueue } from '~/queues/email.queue.js'

export const bookTicket = async (req: AuthRequest, res: Response) => {
  const userId = req.userId!
  const concertId = req.params.concertId
  const { seatType } = req.body

  if (!seatType) return res.status(400).json({ message: 'seatType is required' })

  // ✅ Step 1: Check concert date
  const concert = await Concert.findById(concertId)
  if (!concert) return res.status(404).json({ message: 'Concert not found' })

  const now = new Date()

  if (concert.date < now) {
    return res.status(400).json({ message: 'Booking is closed — concert has started.' })
  }

  // ✅ Step 2: Attempt booking
  const result = await attemptBooking(userId, concertId, seatType)

  if (result === 'OK') return res.status(200).json({ message: 'Booking successful' })

  if (result === 'DUPLICATE') return res.status(409).json({ message: 'You already booked this concert' })
  if (result === 'SOLD_OUT') return res.status(400).json({ message: 'Seat is sold out' })

  return res.status(500).json({ message: 'Unexpected error' })
}

export const getAllBookings = async (_: Request, res: Response) => {
  const bookings = await Booking.find()
  res.json(bookings)
}

export const getBookingById = async (req: Request, res: Response) => {
  const booking = await Booking.findById(req.params.id)
  if (!booking) return res.status(404).json({ message: 'Booking not found' })
  res.json(booking)
}

export const deleteBooking = async (req: Request, res: Response) => {
  const deleted = await Booking.findByIdAndDelete(req.params.id)
  if (!deleted) return res.status(404).json({ message: 'Booking not found' })
  res.json({ message: 'Booking deleted' })
}

export const cancelBooking = async (req: AuthRequest, res: Response) => {
  const userId = req.userId!
  const concertId = req.params.concertId

  // 1. Find and delete booking from DB
  const booking = await Booking.findOneAndDelete({ userId, concertId })
  if (!booking) return res.status(404).json({ message: 'Booking not found' })

  const seatType = booking.seatType

  // 2. Increment Redis seat count & remove Redis lock
  const seatKey = `concert:${concertId}:seat:${seatType}`
  const userKey = `concert:${concertId}:user:${userId}`

  await redis.incr(seatKey)
  await redis.del(userKey)

  // 3. ✅ Update MongoDB Concert document (increment remaining count)
  const result = await Concert.updateOne(
    { _id: concertId, 'seatTypes.type': seatType },
    { $inc: { 'seatTypes.$.remaining': 1 } }
  )

  if (result.modifiedCount === 0) {
    console.warn('⚠️ MongoDB update failed — seat count not incremented')
  }

  return res.json({ message: 'Booking cancelled and seat freed' })
}
