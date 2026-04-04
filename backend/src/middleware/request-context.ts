import { randomUUID } from 'crypto'
import { NextFunction, Request, Response } from 'express'

export function attachRequestContext(req: Request, res: Response, next: NextFunction) {
  const headerValue = req.header('x-request-id')
  const requestId = headerValue && headerValue.trim().length > 0 ? headerValue : randomUUID()

  req.requestId = requestId
  res.setHeader('X-Request-Id', requestId)

  next()
}
