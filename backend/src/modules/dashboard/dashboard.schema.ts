import { z } from 'zod'

export const dashboardQuerySchema = z.object({
  from: z.coerce.date().optional(),
  to: z.coerce.date().optional(),
  recentLimit: z.coerce.number().int().min(1).max(20).default(5),
  trend: z.enum(['hourly', 'daily', 'weekly', 'monthly']).default('monthly'),
})
