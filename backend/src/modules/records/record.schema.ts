import { z } from 'zod'

export const recordTypeSchema = z.enum(['income', 'expense'])

export const recordIdParamSchema = z.object({
  id: z.string().min(1, 'Record id is required'),
})

export const createRecordSchema = z.object({
  amount: z.coerce.number().positive(),
  type: recordTypeSchema,
  category: z.string().trim().min(2).max(80),
  occurredAt: z.coerce.date(),
  notes: z.string().trim().max(500).optional().default(''),
})

export const updateRecordSchema = z
  .object({
    amount: z.coerce.number().positive().optional(),
    type: recordTypeSchema.optional(),
    category: z.string().trim().min(2).max(80).optional(),
    occurredAt: z.coerce.date().optional(),
    notes: z.string().trim().max(500).optional(),
  })
  .refine((value) => Object.keys(value).length > 0, {
    message: 'At least one field must be provided for update',
  })

export const listRecordQuerySchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(20),
  type: recordTypeSchema.optional(),
  category: z.string().trim().min(1).optional(),
  from: z.coerce.date().optional(),
  to: z.coerce.date().optional(),
  search: z.string().trim().min(1).optional(),
  sortBy: z.enum(['occurredAt', 'amount', 'createdAt']).default('occurredAt'),
  sortOrder: z.enum(['asc', 'desc']).default('desc'),
})
