import bcrypt from 'bcryptjs'
import mongoose from 'mongoose'
import { env } from '../../config/env'
import { ApiError } from '../../utils/api-error'
import { UserModel } from './user.model'
import { UserRole } from '../../constants/roles'
import { AuthSessionModel } from '../auth/auth-session.model'

type PublicUserInput = {
  _id: { toString(): string }
  name: string
  email: string
  role: UserRole
  status: 'active' | 'inactive'
  lastLoginAt?: Date | null
  createdAt: Date
  updatedAt: Date
}

function toPublicUser(user: PublicUserInput) {
  return {
    id: user._id.toString(),
    name: user.name,
    email: user.email,
    role: user.role,
    status: user.status,
    lastLoginAt: user.lastLoginAt ?? null,
    createdAt: user.createdAt,
    updatedAt: user.updatedAt,
  }
}

async function ensureEmailIsAvailable(email: string, excludeUserId?: string) {
  const existing = await UserModel.findOne({
    email,
    ...(excludeUserId ? { _id: { $ne: excludeUserId } } : {}),
  })

  if (existing) {
    throw new ApiError(409, 'Email is already in use')
  }
}

function ensureObjectId(id: string, entityName: string) {
  if (!mongoose.isValidObjectId(id)) {
    throw new ApiError(400, `Invalid ${entityName} id`)
  }
}

export async function createUser(payload: {
  name: string
  email: string
  password: string
  role: UserRole
  status: 'active' | 'inactive'
}) {
  await ensureEmailIsAvailable(payload.email)

  const passwordHash = await bcrypt.hash(payload.password, env.BCRYPT_SALT_ROUNDS)
  const user = await UserModel.create({
    name: payload.name,
    email: payload.email,
    passwordHash,
    role: payload.role,
    status: payload.status,
  })

  return toPublicUser(user)
}

export async function listUsers(query: {
  page: number
  limit: number
  role?: UserRole
  status?: 'active' | 'inactive'
  search?: string
}) {
  const filter: Record<string, unknown> = {}

  if (query.role) filter.role = query.role
  if (query.status) filter.status = query.status
  if (query.search) {
    filter.$or = [
      { name: { $regex: query.search, $options: 'i' } },
      { email: { $regex: query.search, $options: 'i' } },
    ]
  }

  const skip = (query.page - 1) * query.limit

  const [users, total] = await Promise.all([
    UserModel.find(filter).sort({ createdAt: -1 }).skip(skip).limit(query.limit).lean(),
    UserModel.countDocuments(filter),
  ])

  return {
    items: users.map(toPublicUser),
    pagination: {
      page: query.page,
      limit: query.limit,
      total,
      totalPages: Math.ceil(total / query.limit),
    },
  }
}

export async function getUserById(id: string) {
  ensureObjectId(id, 'user')
  const user = await UserModel.findById(id).lean()

  if (!user) {
    throw new ApiError(404, 'User not found')
  }

  return toPublicUser(user)
}

export async function updateUser(
  id: string,
  payload: {
    name?: string
    email?: string
    password?: string
    role?: UserRole
    status?: 'active' | 'inactive'
  },
  actorId: string
) {
  ensureObjectId(id, 'user')

  const user = await UserModel.findById(id).select('+passwordHash')

  if (!user) {
    throw new ApiError(404, 'User not found')
  }

  if (payload.email && payload.email !== user.email) {
    await ensureEmailIsAvailable(payload.email, id)
    user.email = payload.email
  }

  const nextRole = payload.role ?? user.role
  const nextStatus = payload.status ?? user.status
  const isRemovingAdminAccess =
    user.role === 'admin' &&
    user.status === 'active' &&
    (nextRole !== 'admin' || nextStatus !== 'active')

  if (isRemovingAdminAccess) {
    const activeAdminCount = await UserModel.countDocuments({ role: 'admin', status: 'active' })

    if (activeAdminCount <= 1) {
      throw new ApiError(400, 'You cannot remove access from the last active admin')
    }
  }

  if (payload.name) user.name = payload.name
  if (payload.role) user.role = payload.role

  if (payload.status) {
    if (actorId === id && payload.status === 'inactive') {
      throw new ApiError(400, 'You cannot deactivate your own account')
    }

    user.status = payload.status
  }

  if (payload.password) {
    user.passwordHash = await bcrypt.hash(payload.password, env.BCRYPT_SALT_ROUNDS)
  }

  await user.save()

  if (payload.email || payload.password || payload.role || payload.status) {
    await AuthSessionModel.updateMany(
      {
        user: id,
        revokedAt: null,
      },
      {
        $set: {
          revokedAt: new Date(),
        },
      }
    )
  }

  return getUserById(id)
}
