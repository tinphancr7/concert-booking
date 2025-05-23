import bodyParser from 'body-parser'
import express, { Request, Response, NextFunction, ErrorRequestHandler } from 'express'
import helmet from 'helmet'
import createError from 'http-errors'

import cors from 'cors'

import compression from 'compression'

import dotenv from 'dotenv'

import { statusCodes } from './constants/status-codes'
import { UnprocessableEntityError } from './core/error.response'
import Database from './db/init.mongodb'
import initialRouter from './routers'
import { syncConcertSeatsToRedis } from './utils/syncConcertSeatsToRedis'

import { createBullBoard } from '@bull-board/api'
import { BullAdapter } from '@bull-board/api/bullAdapter'
import { ExpressAdapter } from '@bull-board/express'
import { emailQueue } from './workers/email.worker'

dotenv.config()

const app = express()

const serverAdapter = new ExpressAdapter()
serverAdapter.setBasePath('/admin/queues')

createBullBoard({
  queues: [new BullAdapter(emailQueue)],
  serverAdapter
})

app.use('/admin/queues', serverAdapter.getRouter()) // mount the dashboard
//init middleware

app.use(helmet())
app.use(compression())
app.use(bodyParser.json())
app.use(bodyParser.urlencoded({ extended: true }))
app.use(cors())

// Properly invoke the MongoDB instance
Database.getInstance()

//init router
initialRouter(app)
syncConcertSeatsToRedis()
//handle error

app.use((req: Request, res: Response, next: NextFunction) => {
  return next(createError(404, 'Not Found'))
})

const errorHandler: ErrorRequestHandler = (err, req, res, next) => {
  const status = err.status || statusCodes.INTERNAL_SERVER_ERROR

  const errorResponse: {
    message: string
    status: number
    typeError: string
    statusMessage: string
    errors?: { field: string; message: string }[]
  } = {
    message: err.message || 'Something went wrong',
    status,
    typeError: err.typeError || 'INTERNAL_SERVER_ERROR',
    statusMessage: err.statusMessage || 'error'
  }

  if (err instanceof UnprocessableEntityError) {
    errorResponse.errors = err.errors
  }

  res.status(status).json(errorResponse)
  return
}

app.use(errorHandler)

app.listen(process.env.PORT || 8888, () => {
  console.log('Server is listening on port ' + process.env.PORT)
})
