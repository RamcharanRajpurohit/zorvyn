import bcrypt from 'bcryptjs'
import { createHash, randomBytes } from 'crypto'
import jwt, { SignOptions } from 'jsonwebtoken'
import { env } from '../../config/env'
import { ApiError } from '../../utils/api-error'
import { UserModel } from '../users/user.model'
import { createUser } from '../users/user.service'
import { AuthSessionModel } from './auth-session.model'

function signAccessToken(user: { id: string; role: string; email: string }) {
  return jwt.sign(
    {
      role: user.role,
      email: user.email,
    },
    env.JWT_SECRET,
    {
      subject: user.id,
      expiresIn: env.JWT_EXPIRES_IN as SignOptions['expiresIn'],
    }
  )
}

type SessionMeta = {
  ipAddress?: string
  userAgent?: string
}

type PublicUser = {
  id: string
  name: string
  email: string
  role: string
  status: 'active' | 'inactive'
  lastLoginAt: Date | null
  createdAt: Date
  updatedAt: Date
}

function mapUser(user: {
  _id: { toString(): string }
  name: string
  email: string
  role: string
  status: 'active' | 'inactive'
  lastLoginAt?: Date | null
  createdAt: Date
  updatedAt: Date
}): PublicUser {
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

function hashRefreshToken(refreshToken: string) {
  return createHash('sha256').update(refreshToken).digest('hex')
}

function createRefreshToken() {
  return randomBytes(48).toString('base64url')
}

function refreshExpiryDate() {
  const expiresAt = new Date()
  expiresAt.setDate(expiresAt.getDate() + env.REFRESH_TOKEN_TTL_DAYS)
  return expiresAt
}

async function issueAuthSession(
  user: {
    _id: { toString(): string }
    name: string
    email: string
    role: string
    status: 'active' | 'inactive'
    lastLoginAt?: Date | null
    createdAt: Date
    updatedAt: Date
  },
  meta: SessionMeta
) {
  const refreshToken = createRefreshToken()
  const refreshTokenHash = hashRefreshToken(refreshToken)

  const session = await AuthSessionModel.create({
    user: user._id,
    refreshTokenHash,
    expiresAt: refreshExpiryDate(),
    userAgent: meta.userAgent ?? '',
    ipAddress: meta.ipAddress ?? '',
    lastUsedAt: new Date(),
    lastUsedIp: meta.ipAddress ?? '',
  })

  const accessToken = signAccessToken({
    id: user._id.toString(),
    role: user.role,
    email: user.email,
  })

  return {
    token: accessToken,
    accessToken,
    refreshToken,
    sessionId: session._id.toString(),
    sessionObjectId: session._id,
    user: mapUser(user),
  }
}

export async function revokeSessionsForUser(userId: string) {
  await AuthSessionModel.updateMany(
    {
      user: userId,
      revokedAt: null,
    },
    {
      $set: {
        revokedAt: new Date(),
      },
    }
  )
}

export async function bootstrapAdmin(payload: {
  name: string
  email: string
  password: string
}, meta: SessionMeta) {
  const existingUsers = await UserModel.countDocuments()

  if (existingUsers > 0) {
    throw new ApiError(403, 'Bootstrap is only allowed when the system has no users')
  }

  const admin = await createUser({
    ...payload,
    role: 'admin',
    status: 'active',
  })

  const adminRecord = await UserModel.findById(admin.id)

  if (!adminRecord) {
    throw new ApiError(500, 'Admin was created but could not be loaded')
  }

  const { sessionObjectId: _sessionObjectId, ...result } = await issueAuthSession(adminRecord, meta)
  return result
}

export async function login(payload: { email: string; password: string }, meta: SessionMeta) {
  const user = await UserModel.findOne({ email: payload.email }).select('+passwordHash')

  if (!user) {
    throw new ApiError(401, 'Invalid email or password')
  }

  if (user.status !== 'active') {
    throw new ApiError(403, 'Your account is inactive')
  }

  const passwordMatches = await bcrypt.compare(payload.password, user.passwordHash)

  if (!passwordMatches) {
    throw new ApiError(401, 'Invalid email or password')
  }

  user.lastLoginAt = new Date()
  await user.save()

  const { sessionObjectId: _sessionObjectId, ...result } = await issueAuthSession(user, meta)
  return result
}

export async function refreshSession(
  payload: { refreshToken: string },
  meta: SessionMeta
) {
  const refreshTokenHash = hashRefreshToken(payload.refreshToken)
  const currentSession = await AuthSessionModel.findOne({
    refreshTokenHash,
  })

  if (!currentSession || currentSession.revokedAt) {
    throw new ApiError(401, 'Refresh token is invalid')
  }

  if (currentSession.expiresAt.getTime() <= Date.now()) {
    currentSession.revokedAt = new Date()
    currentSession.lastUsedAt = new Date()
    await currentSession.save()
    throw new ApiError(401, 'Refresh token has expired')
  }

  const user = await UserModel.findById(currentSession.user)

  if (!user) {
    currentSession.revokedAt = new Date()
    await currentSession.save()
    throw new ApiError(401, 'User linked to this session no longer exists')
  }

  if (user.status !== 'active') {
    currentSession.revokedAt = new Date()
    await currentSession.save()
    throw new ApiError(403, 'This account is inactive')
  }

  const nextSession = await issueAuthSession(user, meta)

  currentSession.revokedAt = new Date()
  currentSession.lastUsedAt = new Date()
  currentSession.lastUsedIp = meta.ipAddress ?? currentSession.lastUsedIp
  await currentSession.save()

  const { sessionObjectId: _sessionObjectId, ...result } = nextSession
  return result
}

export async function logout(payload: { refreshToken: string }) {
  const refreshTokenHash = hashRefreshToken(payload.refreshToken)
  const currentSession = await AuthSessionModel.findOne({
    refreshTokenHash,
  })

  if (!currentSession) {
    return
  }

  if (!currentSession.revokedAt) {
    currentSession.revokedAt = new Date()
    currentSession.lastUsedAt = new Date()
    await currentSession.save()
  }
}
