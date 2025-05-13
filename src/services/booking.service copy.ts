import { Concert } from '~/models/concert.model.js'
import redis from '../config/redis.js'
import { Booking } from '../models/booking.model.js'
import mongoose from 'mongoose'
import { User } from '~/models/user.model.js'
import { sendBookingConfirmationEmail } from '~/utils/mailer.js'
import { generateConfirmationCode } from '~/utils/generateCode.js'
import { emailQueue } from '~/workers/email.worker'

export async function generateUniqueBookingCode(): Promise<string> {
  let code: string
  let exists = true

  do {
    code = generateConfirmationCode()
    exists = !!(await Booking.exists({ code }))
  } while (exists)

  return code
}

export async function attemptBooking(
  userId: string,
  concertId: string,
  seatType: string
): Promise<'OK' | 'DUPLICATE' | 'SOLD_OUT'> {
  const redisKey = `concert:${concertId}:seat:${seatType}`
  const userKey = `concert:${concertId}:user:${userId}`

  // Run Lua in Redis to check and reserve
  const luaScript = `
    if redis.call("get", KEYS[2]) then return "DUPLICATE" end
    local seats = tonumber(redis.call("get", KEYS[1]) or "-1")
    if seats <= 0 then return "SOLD_OUT" end
    redis.call("decr", KEYS[1])
    redis.call("set", KEYS[2], 1)
    return "OK"
  `

  const result = await redis.eval(luaScript, 2, redisKey, userKey)
  if (result !== 'OK') return result as 'DUPLICATE' | 'SOLD_OUT'

  const session = await mongoose.startSession()
  let bookingCreated = false
  try {
    const code = await generateUniqueBookingCode()
    await session.withTransaction(async () => {
      // ✅ Step 1: Create booking

      await Booking.create([{ userId, concertId, seatType, code }], { session })

      // ✅ Step 2: Update remaining seats
      const updateResult = await Concert.updateOne(
        { _id: concertId, 'seatTypes.type': seatType },
        { $inc: { 'seatTypes.$.remaining': -1 } },
        { session }
      )

      if (updateResult.modifiedCount === 0) {
        throw new Error('Concert seatType not updated')
      }
      bookingCreated = true // Only true if Mongo committed
      // ✅ Step 3: send confirmation email (optional)
    })

    // ✅ After Mongo transaction commits successfully
    // if (bookingCreated) {
    //   console.log('Booking created successfully:', code)
    //   await emailQueue.add(
    //     {
    //       userId,
    //       concertId,
    //       seatType,
    //       bookingCode: code
    //     },
    //     {
    //       attempts: 3,
    //       backoff: 5000
    //     }
    //   )
    // }
    return 'OK'
  } catch (error) {
    // ❌ Rollback Redis if DB transaction fails
    await redis.incr(redisKey)
    await redis.del(userKey)
    console.error('❌ Transaction failed, Redis rolled back:', error)
    return 'SOLD_OUT' // or 'ERROR'
  } finally {
    session.endSession()
  }
}
