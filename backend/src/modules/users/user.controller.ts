import { Request, Response } from 'express'
import { successResponse } from '../../utils/api-response'
import * as userService from './user.service'

export async function createUser(req: Request, res: Response) {
  const user = await userService.createUser(req.body)
  res.status(201).json(successResponse(user, 'User created successfully'))
}

export async function listUsers(req: Request, res: Response) {
  const users = await userService.listUsers(req.query as never)
  res.json(successResponse(users, 'Users fetched successfully'))
}

export async function getUserById(req: Request, res: Response) {
  const user = await userService.getUserById(req.params.id as string)
  res.json(successResponse(user, 'User fetched successfully'))
}

export async function updateUser(req: Request, res: Response) {
  const user = await userService.updateUser(req.params.id as string, req.body, req.user!.id)
  res.json(successResponse(user, 'User updated successfully'))
}
