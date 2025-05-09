// src/controllers/concert.controller.ts
import { Request, Response } from 'express'
import { Concert } from '../models/concert.model.js'

export const getAllConcerts = async (_: Request, res: Response) => {
  const concerts = await Concert.find()
  res.json(concerts)
}

export const getConcertById = async (req: Request, res: Response) => {
  const concert = await Concert.findById(req.params.id)
  if (!concert) return res.status(404).json({ message: 'Concert not found' })
  res.json(concert)
}

export const createConcert = async (req: Request, res: Response) => {
  const concert = await Concert.create(req.body)
  res.status(201).json(concert)
}

export const updateConcert = async (req: Request, res: Response) => {
  const updated = await Concert.findByIdAndUpdate(req.params.id, req.body, { new: true })
  if (!updated) return res.status(404).json({ message: 'Concert not found' })
  res.json(updated)
}

export const deleteConcert = async (req: Request, res: Response) => {
  const deleted = await Concert.findByIdAndDelete(req.params.id)
  if (!deleted) return res.status(404).json({ message: 'Concert not found' })
  res.json({ message: 'Concert deleted' })
}
