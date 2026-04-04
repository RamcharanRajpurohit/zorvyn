import { NextFunction, Request, Response } from 'express'
import { UserRole } from '../constants/roles'
import { ApiError } from '../utils/api-error'

export function authorize(...roles: UserRole[]) {
  return (req: Request, _res: Response, next: NextFunction) => {
    if (!req.user) {
      return next(new ApiError(401, 'Authentication is required'))
    }

    if (!roles.includes(req.user.role)) {
      return next(new ApiError(403, 'You do not have permission to perform this action'))
    }

    next()
  }
}
