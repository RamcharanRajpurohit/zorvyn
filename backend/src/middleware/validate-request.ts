import { NextFunction, Request, Response } from 'express'
import { ZodSchema } from 'zod'

type Schemas = {
  body?: ZodSchema
  query?: ZodSchema
  params?: ZodSchema
}

export function validateRequest(schemas: Schemas) {
  return (req: Request, _res: Response, next: NextFunction) => {
    if (schemas.body) {
      req.body = schemas.body.parse(req.body) as Request['body']
    }

    if (schemas.query) {
      const parsedQuery = schemas.query.parse(req.query) as Record<string, unknown>
      Object.assign(req.query as Record<string, unknown>, parsedQuery)
    }

    if (schemas.params) {
      const parsedParams = schemas.params.parse(req.params) as Record<string, string>
      Object.assign(req.params, parsedParams)
    }

    next()
  }
}
