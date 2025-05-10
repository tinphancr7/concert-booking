import IORedis from 'ioredis'

export const connection = new IORedis(process.env.REDIS_URL!, {
  maxRetriesPerRequest: null // ✅ REQUIRED for BullMQ compatibility
})
connection.on('error', (err) => {
  console.error('Redis connection error:', err)
})
connection.on('connect', () => {
  console.log('Redis connected2')
})
