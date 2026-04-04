"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.listRecordQuerySchema = exports.updateRecordSchema = exports.createRecordSchema = exports.recordIdParamSchema = exports.recordTypeSchema = void 0;
const zod_1 = require("zod");
exports.recordTypeSchema = zod_1.z.enum(['income', 'expense']);
exports.recordIdParamSchema = zod_1.z.object({
    id: zod_1.z.string().min(1, 'Record id is required'),
});
exports.createRecordSchema = zod_1.z.object({
    amount: zod_1.z.coerce.number().positive(),
    type: exports.recordTypeSchema,
    category: zod_1.z.string().trim().min(2).max(80),
    occurredAt: zod_1.z.coerce.date(),
    notes: zod_1.z.string().trim().max(500).optional().default(''),
});
exports.updateRecordSchema = zod_1.z
    .object({
    amount: zod_1.z.coerce.number().positive().optional(),
    type: exports.recordTypeSchema.optional(),
    category: zod_1.z.string().trim().min(2).max(80).optional(),
    occurredAt: zod_1.z.coerce.date().optional(),
    notes: zod_1.z.string().trim().max(500).optional(),
})
    .refine((value) => Object.keys(value).length > 0, {
    message: 'At least one field must be provided for update',
});
exports.listRecordQuerySchema = zod_1.z.object({
    page: zod_1.z.coerce.number().int().min(1).default(1),
    limit: zod_1.z.coerce.number().int().min(1).max(100).default(20),
    type: exports.recordTypeSchema.optional(),
    category: zod_1.z.string().trim().min(1).optional(),
    from: zod_1.z.coerce.date().optional(),
    to: zod_1.z.coerce.date().optional(),
    search: zod_1.z.string().trim().min(1).optional(),
    sortBy: zod_1.z.enum(['occurredAt', 'amount', 'createdAt']).default('occurredAt'),
    sortOrder: zod_1.z.enum(['asc', 'desc']).default('desc'),
});
