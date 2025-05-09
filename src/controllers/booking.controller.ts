import { Request, Response } from 'express'
import { attemptBooking } from '../services/booking.service.js'
import { AuthRequest } from '../utils/requireAuth.js'
import { Booking } from '~/models/booking.model.js'

export const bookTicket = async (req: AuthRequest, res: Response) => {
  const userId = req.userId!
  const concertId = req.params.concertId
  const { seatType } = req.body

  if (!seatType) return res.status(400).json({ message: 'seatType is required' })

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
