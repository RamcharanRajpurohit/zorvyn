"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.dashboardQuerySchema = void 0;
const zod_1 = require("zod");
exports.dashboardQuerySchema = zod_1.z.object({
    from: zod_1.z.coerce.date().optional(),
    to: zod_1.z.coerce.date().optional(),
    recentLimit: zod_1.z.coerce.number().int().min(1).max(20).default(5),
    trend: zod_1.z.enum(['daily', 'weekly', 'monthly']).default('monthly'),
});
