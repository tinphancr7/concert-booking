import { Application } from 'express'
import authRouter from './auth.router'
import concertRouter from './concert.routes'
import bookingRouter from './booking.routes'

const initialRouter = (app: Application) => {
  app.use('/api/v1/auth', authRouter)
  app.use('/api/v1/concerts', concertRouter)
  app.use('/api/v1/bookings', bookingRouter)
}
export default initialRouter
