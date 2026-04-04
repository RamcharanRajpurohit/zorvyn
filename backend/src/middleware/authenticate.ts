import { NextFunction, Request, Response } from 'express'
import jwt from 'jsonwebtoken'
import { env } from '../config/env'
import { ApiError } from '../utils/api-error'
import { UserModel } from '../modules/users/user.model'

interface JwtPayload {
  sub: string
  role: string
  email: string
}

export async function authenticate(req: Request, _res: Response, next: NextFunction) {
  const authHeader = req.headers.authorization

  if (!authHeader?.startsWith('Bearer ')) {
    return next(new ApiError(401, 'Authentication token is missing'))
  }

  const token = authHeader.slice(7)

  try {
    const payload = jwt.verify(token, env.JWT_SECRET) as JwtPayload
    const user = await UserModel.findById(payload.sub).lean()

    if (!user) {
      return next(new ApiError(401, 'User linked to this token no longer exists'))
    }

    if (user.status !== 'active') {
      return next(new ApiError(403, 'This account is inactive'))
    }

    req.user = {
      id: user._id.toString(),
      name: user.name,
      email: user.email,
      role: user.role,
      status: user.status,
    }

    next()
  } catch {
    next(new ApiError(401, 'Invalid or expired token'))
  }
}
