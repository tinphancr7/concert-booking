import mongoose, { Document, Schema } from 'mongoose'
import { SeatType } from './concert.model.js'

export interface IBooking extends Document {
  userId: string
  concertId: string
  seatType: SeatType
  createdAt: Date
}

const BookingSchema = new Schema<IBooking>(
  {
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    concertId: { type: Schema.Types.ObjectId, ref: 'Concert', required: true },
    seatType: { type: String, required: true }
  },
  { timestamps: { createdAt: 'createdAt' } }
)

BookingSchema.index({ userId: 1, concertId: 1 }, { unique: true }) // one ticket per user per concert

export const Booking = mongoose.model<IBooking>('Booking', BookingSchema)
