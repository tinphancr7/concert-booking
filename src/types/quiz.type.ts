import { Document, Schema } from 'mongoose'
import { Question } from './question.type'

export type Feedback_mode = 'default' | 'reveal' | 'retry'
export interface Setting {
  duration: number
  hide_time: boolean
  feedback_mode: Feedback_mode
  limit: number
  pass_score: number
}
export interface Quiz extends Document {
  title: string
  description: string
  questions: Schema.Types.ObjectId[]
  setting: Setting
}

export type QuizQueryParams = {
  limit?: number | string
  page?: number | string
  search?: string
}

export type CreateQuizParams = {
  title: string
  description: string
  questions: Question[]
  setting: Setting
}

export type UpdateQuiz = Partial<CreateQuizParams>
