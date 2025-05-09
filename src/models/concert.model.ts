import mongoose, { Document, Schema } from 'mongoose'

export type SeatType = 'VIP' | 'Regular' | 'Standing'

export interface ISeatInfo {
  type: SeatType
  total: number
  remaining: number
}

export interface IConcert extends Document {
  name: string
  date: Date
  seatTypes: ISeatInfo[]
}

const ConcertSchema = new Schema<IConcert>({
  name: { type: String, required: true },
  date: { type: Date, required: true },
  seatTypes: [
    {
      type: { type: String, required: true },
      total: { type: Number, required: true },
      remaining: { type: Number, required: true }
    }
  ]
})

export const Concert = mongoose.model<IConcert>('Concert', ConcertSchema)
