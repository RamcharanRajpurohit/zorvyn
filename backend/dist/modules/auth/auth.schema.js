"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.refreshSessionSchema = exports.loginSchema = exports.bootstrapAdminSchema = void 0;
const zod_1 = require("zod");
exports.bootstrapAdminSchema = zod_1.z.object({
    name: zod_1.z.string().trim().min(2).max(80),
    email: zod_1.z.email().transform((value) => value.toLowerCase()),
    password: zod_1.z.string().min(8).max(64),
});
exports.loginSchema = zod_1.z.object({
    email: zod_1.z.email().transform((value) => value.toLowerCase()),
    password: zod_1.z.string().min(8).max(64),
});
exports.refreshSessionSchema = zod_1.z.object({
    refreshToken: zod_1.z.string().trim().min(32).max(512),
});
