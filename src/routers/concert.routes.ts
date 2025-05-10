import { Router } from 'express'
import {
  createConcert,
  deleteConcert,
  getAllConcerts,
  getConcertById,
  updateConcert
} from '~/controllers/concert.controller'

const router = Router()

router.get('/', getAllConcerts)
router.get('/:id', getConcertById)
router.post('/', createConcert)
router.put('/:id', updateConcert)
router.delete('/:id', deleteConcert)

export default router
