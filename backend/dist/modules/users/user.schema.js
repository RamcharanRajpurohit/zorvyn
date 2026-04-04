"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.userIdParamSchema = exports.updateUserSchema = exports.createUserSchema = exports.userQuerySchema = void 0;
const zod_1 = require("zod");
const roles_1 = require("../../constants/roles");
const objectIdParamSchema = zod_1.z.object({
    id: zod_1.z.string().min(1, 'User id is required'),
});
exports.userQuerySchema = zod_1.z.object({
    page: zod_1.z.coerce.number().int().min(1).default(1),
    limit: zod_1.z.coerce.number().int().min(1).max(100).default(10),
    role: zod_1.z.enum(roles_1.USER_ROLES).optional(),
    status: zod_1.z.enum(roles_1.USER_STATUSES).optional(),
    search: zod_1.z.string().trim().min(1).optional(),
});
exports.createUserSchema = zod_1.z.object({
    name: zod_1.z.string().trim().min(2).max(80),
    email: zod_1.z.email().transform((value) => value.toLowerCase()),
    password: zod_1.z.string().min(8).max(64),
    role: zod_1.z.enum(roles_1.USER_ROLES),
    status: zod_1.z.enum(roles_1.USER_STATUSES).default('active'),
});
exports.updateUserSchema = zod_1.z
    .object({
    name: zod_1.z.string().trim().min(2).max(80).optional(),
    email: zod_1.z.email().transform((value) => value.toLowerCase()).optional(),
    password: zod_1.z.string().min(8).max(64).optional(),
    role: zod_1.z.enum(roles_1.USER_ROLES).optional(),
    status: zod_1.z.enum(roles_1.USER_STATUSES).optional(),
})
    .refine((value) => Object.keys(value).length > 0, {
    message: 'At least one field must be provided for update',
});
exports.userIdParamSchema = objectIdParamSchema;
