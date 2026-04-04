"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.errorHandler = errorHandler;
const mongoose_1 = __importDefault(require("mongoose"));
const zod_1 = require("zod");
const api_error_1 = require("../utils/api-error");
const env_1 = require("../config/env");
const logger_1 = require("../utils/logger");
function logError(req, err, statusCode) {
    const error = err instanceof Error
        ? {
            name: err.name,
            message: err.message,
            stack: env_1.env.NODE_ENV === 'production' ? undefined : err.stack,
        }
        : err;
    logger_1.logger.error('Request failed', {
        requestId: req.requestId,
        method: req.method,
        path: req.originalUrl,
        statusCode,
        user: req.user?.email,
        role: req.user?.role,
        error,
    });
}
function errorHandler(err, req, res, _next) {
    if (err instanceof zod_1.ZodError) {
        logError(req, err, 400);
        return res.status(400).json({
            success: false,
            message: 'Validation failed',
            errors: err.issues.map((issue) => ({
                path: issue.path.join('.'),
                message: issue.message,
            })),
        });
    }
    if (err instanceof api_error_1.ApiError) {
        logError(req, err, err.statusCode);
        return res.status(err.statusCode).json({
            success: false,
            message: err.message,
            details: err.details,
        });
    }
    if (err instanceof mongoose_1.default.Error.ValidationError) {
        logError(req, err, 400);
        return res.status(400).json({
            success: false,
            message: 'Database validation failed',
            errors: Object.values(err.errors).map((error) => error.message),
        });
    }
    if (typeof err === 'object' &&
        err !== null &&
        'code' in err &&
        err.code === 11000) {
        logError(req, err, 409);
        return res.status(409).json({
            success: false,
            message: 'A unique field value already exists',
        });
    }
    logError(req, err, 500);
    return res.status(500).json({
        success: false,
        message: 'Internal server error',
    });
}
