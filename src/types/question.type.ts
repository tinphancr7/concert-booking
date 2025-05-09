import { Schema } from 'mongoose'
import { QuizType } from '~/constants/enums'

export interface Option {
  text: string
  is_correct: boolean
  _id: Schema.Types.ObjectId
}

export interface Question {
  quiz: Schema.Types.ObjectId
  question: string
  type: QuizType
  options: Option[]
  explanation?: string
  point: number
  is_required?: boolean
}
