"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.env = void 0;
const dotenv_1 = __importDefault(require("dotenv"));
const zod_1 = require("zod");
dotenv_1.default.config();
const envSchema = zod_1.z.object({
    NODE_ENV: zod_1.z.enum(['development', 'test', 'production']).default('development'),
    PORT: zod_1.z.coerce.number().int().positive().default(4000),
    API_PREFIX: zod_1.z.string().default('/api/v1'),
    CLIENT_ORIGIN: zod_1.z.string().default('http://localhost:3000'),
    MONGODB_URI: zod_1.z.string().min(1, 'MONGODB_URI is required'),
    MONGODB_DB_NAME: zod_1.z.string().default('expense_tracker'),
    JWT_SECRET: zod_1.z.string().min(16, 'JWT_SECRET must be at least 16 characters long'),
    JWT_EXPIRES_IN: zod_1.z.string().default('15m'),
    REFRESH_TOKEN_TTL_DAYS: zod_1.z.coerce.number().int().min(1).max(365).default(30),
    BCRYPT_SALT_ROUNDS: zod_1.z.coerce.number().int().min(8).max(14).default(10),
});
const parsed = envSchema.safeParse(process.env);
if (!parsed.success) {
    console.error('Invalid environment configuration', parsed.error.flatten().fieldErrors);
    throw new Error('Environment validation failed');
}
exports.env = parsed.data;
