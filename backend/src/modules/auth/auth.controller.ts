import { Request, Response } from 'express'
import { successResponse } from '../../utils/api-response'
import * as authService from './auth.service'

function getSessionMeta(req: Request) {
  return {
    ipAddress: req.ip ?? req.socket.remoteAddress ?? '',
    userAgent: req.get('user-agent') ?? '',
  }
}

export async function bootstrapAdmin(req: Request, res: Response) {
  const result = await authService.bootstrapAdmin(req.body, getSessionMeta(req))
  res.status(201).json(successResponse(result, 'Admin bootstrapped successfully'))
}

export async function login(req: Request, res: Response) {
  const result = await authService.login(req.body, getSessionMeta(req))
  res.json(successResponse(result, 'Login successful'))
}

export async function refresh(req: Request, res: Response) {
  const result = await authService.refreshSession(req.body, getSessionMeta(req))
  res.json(successResponse(result, 'Session refreshed successfully'))
}

export async function logout(req: Request, res: Response) {
  await authService.logout(req.body)
  res.json(successResponse({ loggedOut: true }, 'Logout successful'))
}

export async function me(req: Request, res: Response) {
  res.json(successResponse(req.user!, 'Authenticated user fetched successfully'))
}
