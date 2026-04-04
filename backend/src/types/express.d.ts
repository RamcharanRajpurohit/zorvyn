import { UserRole, UserStatus } from '../constants/roles'

declare global {
  namespace Express {
    interface AuthUser {
      id: string
      name: string
      email: string
      role: UserRole
      status: UserStatus
    }

    interface Request {
      user?: AuthUser
      requestId?: string
    }
  }
}

export {}
