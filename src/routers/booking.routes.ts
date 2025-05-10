import { Router } from 'express'
import { bookTicket, cancelBooking, getAllBookings } from '~/controllers/booking.controller'
import { requireAuth } from '~/utils/requireAuth'

const router = Router()

router.get('/', requireAuth, getAllBookings)
router.post('/:concertId/book', requireAuth, bookTicket)
router.delete('/:concertId/cancel', requireAuth, cancelBooking)

export default router
