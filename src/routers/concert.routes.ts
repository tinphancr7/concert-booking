import { Router } from 'express'
import { listConcerts } from '~/controllers/concert.controller'

const router = Router()

router.get('/', listConcerts)

export default router
