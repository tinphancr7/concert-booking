import mongoose, { Document, Schema, Types } from 'mongoose'
import { SeatType } from './concert.model.js'

export interface IBooking extends Document {
  userId: Types.ObjectId
  concertId: Types.ObjectId
  code: string
  seatType: SeatType
  createdAt: Date
}
const BookingSchema = new Schema<IBooking>(
  {
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    concertId: { type: Schema.Types.ObjectId, ref: 'Concert', required: true },
    code: { type: String, required: true, unique: true },
    seatType: { type: String, required: true }
  },
  { timestamps: { createdAt: 'createdAt' } }
)

BookingSchema.index({ userId: 1, concertId: 1 }, { unique: true }) // one ticket per user per concert

export const Booking = mongoose.model<IBooking>('Booking', BookingSchema)
