// src/utils/syncConcertSeatsToRedis.ts
import { Concert } from '../models/concert.model.js'
import redis from '../config/redis.js'

export async function syncConcertSeatsToRedis() {
  const concerts = await Concert.find()

  for (const concert of concerts) {
    for (const seat of concert.seatTypes) {
      const key = `concert:${concert._id.toString()}:seat:${seat.type}`
      const exists = await redis.exists(key)
      if (!exists) {
        await redis.set(key, seat.remaining)
      }
    }
  }

  console.log('Redis seat counters synced from MongoDB')
}
