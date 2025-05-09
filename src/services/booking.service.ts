import redis from '../config/redis.js'
import { Booking } from '../models/booking.model.js'

export async function attemptBooking(
  userId: string,
  concertId: string,
  seatType: string
): Promise<'OK' | 'DUPLICATE' | 'SOLD_OUT'> {
  const redisKey = `concert:${concertId}:seat:${seatType}`
  const userKey = `concert:${concertId}:user:${userId}`

  const luaScript = `
    if redis.call("get", KEYS[2]) then
      return "DUPLICATE"
    end
    local seats = tonumber(redis.call("get", KEYS[1]) or "-1")
    if seats <= 0 then
      return "SOLD_OUT"
    end
    redis.call("decr", KEYS[1])
    redis.call("set", KEYS[2], 1)
    return "OK"
  `

  const result = await redis.eval(luaScript, 2, redisKey, userKey)

  if (result === 'OK') {
    await Booking.create({ userId, concertId, seatType })
  }

  return result as 'OK' | 'DUPLICATE' | 'SOLD_OUT'
}
