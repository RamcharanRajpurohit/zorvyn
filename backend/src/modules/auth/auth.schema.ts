import { z } from 'zod'

export const bootstrapAdminSchema = z.object({
  name: z.string().trim().min(2).max(80),
  email: z.email().transform((value) => value.toLowerCase()),
  password: z.string().min(8).max(64),
})

export const loginSchema = z.object({
  email: z.email().transform((value) => value.toLowerCase()),
  password: z.string().min(8).max(64),
})

export const refreshSessionSchema = z.object({
  refreshToken: z.string().trim().min(32).max(512),
})
