import Queue from 'bull'
import { Concert } from '../models/concert.model'
import { User } from '../models/user.model'
import { sendBookingConfirmationEmail } from '../utils/mailer'

const emailQueue = new Queue('emailQueue', process.env.REDIS_URL!)

emailQueue.process(async (job) => {
  const { userId, concertId, seatType, bookingCode } = job.data

  const user = await User.findById(userId)
  const concert = await Concert.findById(concertId)

  if (user?.email && concert) {
    await sendBookingConfirmationEmail(user.email, concert.name, seatType, concert.date, bookingCode)
    console.log(`✅ Email sent to ${user.email}`)
  }
})
emailQueue.on('completed', (job) => {
  console.log(`🎉 Job ${job.id} completed`)
})

emailQueue.on('failed', (job, err) => {
  console.error(`❌ Job ${job?.id} failed:`, err)
})

export { emailQueue }
