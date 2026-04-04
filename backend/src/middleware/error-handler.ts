import { NextFunction, Request, Response } from 'express'
import mongoose from 'mongoose'
import { ZodError } from 'zod'
import { ApiError } from '../utils/api-error'
import { env } from '../config/env'
import { logger } from '../utils/logger'

function logError(req: Request, err: unknown, statusCode: number) {
  const error =
    err instanceof Error
      ? {
          name: err.name,
          message: err.message,
          stack: env.NODE_ENV === 'production' ? undefined : err.stack,
        }
      : err

  logger.error('Request failed', {
    requestId: req.requestId,
    method: req.method,
    path: req.originalUrl,
    statusCode,
    user: req.user?.email,
    role: req.user?.role,
    error,
  })
}

export function errorHandler(
  err: unknown,
  req: Request,
  res: Response,
  _next: NextFunction
) {
  if (err instanceof ZodError) {
    logError(req, err, 400)

    return res.status(400).json({
      success: false,
      message: 'Validation failed',
      errors: err.issues.map((issue) => ({
        path: issue.path.join('.'),
        message: issue.message,
      })),
    })
  }

  if (err instanceof ApiError) {
    logError(req, err, err.statusCode)

    return res.status(err.statusCode).json({
      success: false,
      message: err.message,
      details: err.details,
    })
  }

  if (err instanceof mongoose.Error.ValidationError) {
    logError(req, err, 400)

    return res.status(400).json({
      success: false,
      message: 'Database validation failed',
      errors: Object.values(err.errors).map((error) => error.message),
    })
  }

  if (
    typeof err === 'object' &&
    err !== null &&
    'code' in err &&
    err.code === 11000
  ) {
    logError(req, err, 409)

    return res.status(409).json({
      success: false,
      message: 'A unique field value already exists',
    })
  }

  logError(req, err, 500)

  return res.status(500).json({
    success: false,
    message: 'Internal server error',
  })
}
