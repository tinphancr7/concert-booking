import Queue from 'bull'
import { Concert } from '../models/concert.model'
import { User } from '../models/user.model'
import { sendBookingConfirmationEmail } from '../utils/mailer'
// src/types/queue.ts

const redisOptions = {
  redis: {
    host: 'cheerful-ewe-28547.upstash.io',
    port: 6379,
    password: 'AW-DAAIjcDE0YzE4MGRiODcxZjg0NTU3OGQxYjkxMTQxM2UxMDhhZnAxMA',
    username: 'default',
    tls: {
      rejectUnauthorized: false
    }
  }
}
const emailQueue = new Queue('emailQueue', redisOptions)

emailQueue.on('ready', () => {
  console.log('✅ Redis connection established.')
})

// Fires on Redis connection error
emailQueue.on('error', (err) => {
  console.error('❌ Redis connection error:', err)
})
emailQueue.process(async (job) => {
  const { userId, concertId, seatType, bookingCode } = job.data

  const user = await User.findById(userId)
  const concert = await Concert.findById(concertId)

  if (user?.email && concert) {
    await sendBookingConfirmationEmail(user.email, concert.name, seatType, concert.date, bookingCode)
  }
})
emailQueue.on('completed', (job) => {
  console.log(`🎉 Job ${job.id} completed`)
})

emailQueue.on('failed', (job, err) => {
  console.error(`❌ Job ${job?.id} failed:`, err)
})

export { emailQueue }
