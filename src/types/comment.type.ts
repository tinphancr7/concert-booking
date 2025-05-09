import { Schema } from 'mongoose'
import { CommentStatus } from '~/constants/enums'

export interface CommentModelProps extends Document {
  _id: string
  content: string
  lesson: Schema.Types.ObjectId
  user: Schema.Types.ObjectId
  status: CommentStatus
  parentId?: Schema.Types.ObjectId
  mentions?: Schema.Types.ObjectId[]
}
export type TParamsGetComments = {
  limit?: number | string
  page?: number | string
  search?: string
  lessonId?: string
  status?: CommentStatus
}

export type TParamsCreateComment = {
  lessonId: string
  content: string
  parentId?: string
  mentions?: string[]
}

export type TParamsEditComment = {
  content?: string
  mentions?: string[]
}
