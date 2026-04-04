"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.createApp = createApp;
const compression_1 = __importDefault(require("compression"));
const cors_1 = __importDefault(require("cors"));
const express_1 = __importDefault(require("express"));
const express_rate_limit_1 = __importDefault(require("express-rate-limit"));
const helmet_1 = __importDefault(require("helmet"));
const env_1 = require("./config/env");
const auth_routes_1 = __importDefault(require("./modules/auth/auth.routes"));
const user_routes_1 = __importDefault(require("./modules/users/user.routes"));
const record_routes_1 = __importDefault(require("./modules/records/record.routes"));
const dashboard_routes_1 = __importDefault(require("./modules/dashboard/dashboard.routes"));
const error_handler_1 = require("./middleware/error-handler");
const not_found_1 = require("./middleware/not-found");
const authenticate_1 = require("./middleware/authenticate");
const request_context_1 = require("./middleware/request-context");
const request_logger_1 = require("./middleware/request-logger");
function createApp() {
    const app = (0, express_1.default)();
    app.use((0, helmet_1.default)());
    app.use((0, cors_1.default)({
        origin: env_1.env.CLIENT_ORIGIN,
        credentials: false,
    }));
    app.use((0, compression_1.default)());
    app.use(request_context_1.attachRequestContext);
    app.use(express_1.default.json());
    app.use(express_1.default.urlencoded({ extended: true }));
    app.use((0, request_logger_1.createRequestLogger)());
    app.use((0, express_rate_limit_1.default)({
        windowMs: 15 * 60 * 1000,
        max: 300,
        standardHeaders: true,
        legacyHeaders: false,
    }));
    app.get('/health', (_req, res) => {
        res.json({
            success: true,
            message: 'Backend is healthy',
            data: {
                uptime: process.uptime(),
                timestamp: new Date().toISOString(),
            },
        });
    });
    app.use(`${env_1.env.API_PREFIX}/auth`, auth_routes_1.default);
    app.use(`${env_1.env.API_PREFIX}/users`, authenticate_1.authenticate, user_routes_1.default);
    app.use(`${env_1.env.API_PREFIX}/records`, authenticate_1.authenticate, record_routes_1.default);
    app.use(`${env_1.env.API_PREFIX}/dashboard`, authenticate_1.authenticate, dashboard_routes_1.default);
    app.use(not_found_1.notFoundHandler);
    app.use(error_handler_1.errorHandler);
    return app;
}
