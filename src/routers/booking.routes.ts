import { Router } from 'express'
import { bookTicket } from '~/controllers/booking.controller'
import { requireAuth } from '~/utils/requireAuth'

const router = Router()

router.post('/:concertId/book', requireAuth, bookTicket)

export default router
