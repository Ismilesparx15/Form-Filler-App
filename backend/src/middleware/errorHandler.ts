import { Request, Response, NextFunction } from 'express'
import { ZodError } from 'zod'
import logger from '../utils/logger'

export class AppError extends Error {
  constructor(
    public statusCode: number,
    message: string
  ) {
    super(message)
    this.name = 'AppError'
  }
}

export const errorHandler = (
  err: Error,
  req: Request,
  res: Response,
  next: NextFunction
) => {
  logger.error('Error:', {
    error: err,
    path: req.path,
    method: req.method,
    body: req.body,
    query: req.query,
  })

  // Handle validation errors
  if (err instanceof ZodError) {
    return res.status(400).json({
      error: 'Validation error',
      details: err.errors,
    })
  }

  // Handle known application errors
  if (err instanceof AppError) {
    return res.status(err.statusCode).json({
      error: err.message,
    })
  }

  // Handle Mongoose validation errors
  if (err.name === 'ValidationError') {
    return res.status(400).json({
      error: 'Validation error',
      details: err.message,
    })
  }

  // Handle MongoDB duplicate key errors
  if (err.name === 'MongoServerError' && (err as any).code === 11000) {
    return res.status(409).json({
      error: 'Duplicate entry',
    })
  }

  // Handle unknown errors
  const statusCode = res.statusCode !== 200 ? res.statusCode : 500
  res.status(statusCode).json({
    error: process.env.NODE_ENV === 'production' 
      ? 'Internal server error' 
      : err.message,
  })
}
