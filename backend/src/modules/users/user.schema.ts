import { z } from 'zod'
import { USER_ROLES, USER_STATUSES } from '../../constants/roles'

const objectIdParamSchema = z.object({
  id: z.string().min(1, 'User id is required'),
})

export const userQuerySchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(10),
  role: z.enum(USER_ROLES).optional(),
  status: z.enum(USER_STATUSES).optional(),
  search: z.string().trim().min(1).optional(),
})

export const createUserSchema = z.object({
  name: z.string().trim().min(2).max(80),
  email: z.email().transform((value) => value.toLowerCase()),
  password: z.string().min(8).max(64),
  role: z.enum(USER_ROLES),
  status: z.enum(USER_STATUSES).default('active'),
})

export const updateUserSchema = z
  .object({
    name: z.string().trim().min(2).max(80).optional(),
    email: z.email().transform((value) => value.toLowerCase()).optional(),
    password: z.string().min(8).max(64).optional(),
    role: z.enum(USER_ROLES).optional(),
    status: z.enum(USER_STATUSES).optional(),
  })
  .refine((value) => Object.keys(value).length > 0, {
    message: 'At least one field must be provided for update',
  })

export const userIdParamSchema = objectIdParamSchema
