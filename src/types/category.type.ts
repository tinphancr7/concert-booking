import { Document } from 'mongoose'

export interface Category extends Document {
  id: string
  name: string
  slug: string
  createdBy?: string
}

export type CategoryQueryParams = {
  limit?: number | string
  page?: number | string
  search?: string
}

export type NewCategory = {
  name: string
  slug: string
}

export type UpdateCategory = Partial<NewCategory>
