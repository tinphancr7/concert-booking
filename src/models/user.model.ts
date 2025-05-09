import mongoose, { Document, Schema } from 'mongoose'

export interface IUser extends Document {
  email: string
  passwordHash: string
  createdAt: Date
}

const UserSchema = new Schema<IUser>(
  {
    email: { type: String, required: true, unique: true },
    passwordHash: { type: String, required: true }
  },
  { timestamps: { createdAt: 'createdAt' } }
)

export const User = mongoose.model<IUser>('User', UserSchema)
