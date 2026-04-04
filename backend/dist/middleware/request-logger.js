"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.createRequestLogger = createRequestLogger;
const morgan_1 = __importDefault(require("morgan"));
const env_1 = require("../config/env");
const ANSI = {
    reset: '\x1b[0m',
    dim: '\x1b[2m',
    green: '\x1b[32m',
    yellow: '\x1b[33m',
    red: '\x1b[31m',
    cyan: '\x1b[36m',
};
function asRequest(req) {
    return req;
}
function colorize(text, color) {
    return `${color}${text}${ANSI.reset}`;
}
morgan_1.default.token('request-id', (req) => asRequest(req).requestId ?? '-');
morgan_1.default.token('user-email', (req) => asRequest(req).user?.email ?? 'anonymous');
morgan_1.default.token('user-role', (req) => asRequest(req).user?.role ?? 'guest');
morgan_1.default.token('iso-date', () => new Date().toISOString());
function shouldSkip(path) {
    return path === '/health';
}
function shortRequestId(requestId) {
    return requestId ? requestId.slice(0, 8) : '-';
}
function shortTimestamp() {
    return new Date().toISOString().slice(11, 23);
}
function formatDateValue(value) {
    const parsed = new Date(value);
    if (Number.isNaN(parsed.getTime())) {
        return value;
    }
    return parsed.toISOString().slice(0, 10);
}
function formatQueryValue(key, value) {
    if (key === 'from' || key === 'to') {
        return formatDateValue(value);
    }
    if (key === 'search') {
        return value.length > 18 ? `${value.slice(0, 18)}...` : value;
    }
    return value;
}
function summarizeQuery(req) {
    const originalUrl = req.originalUrl || req.url;
    const [, rawQuery = ''] = originalUrl.split('?');
    if (!rawQuery) {
        return '';
    }
    const params = new URLSearchParams(rawQuery);
    const orderedKeys = [
        'trend',
        'recentLimit',
        'page',
        'limit',
        'type',
        'category',
        'sortBy',
        'sortOrder',
        'search',
        'from',
        'to',
    ];
    const parts = orderedKeys
        .filter((key) => params.has(key))
        .map((key) => `${key}=${formatQueryValue(key, params.get(key) ?? '')}`);
    return parts.length > 0 ? ` ${parts.join(' ')}` : '';
}
function actorLabel(req) {
    if (!req.user) {
        return 'guest';
    }
    return `${req.user.email}(${req.user.role})`;
}
function durationLabel(responseTime) {
    const durationMs = Math.round(Number(responseTime ?? 0));
    if (durationMs >= 1000) {
        return `${(durationMs / 1000).toFixed(1)}s`;
    }
    return `${durationMs}ms`;
}
function performanceFlag(responseTime) {
    const durationMs = Number(responseTime ?? 0);
    if (durationMs >= 1000) {
        return ' slow';
    }
    if (durationMs >= 500) {
        return ' warm';
    }
    return '';
}
function statusColor(statusCode) {
    if (statusCode >= 500) {
        return ANSI.red;
    }
    if (statusCode >= 400) {
        return ANSI.yellow;
    }
    return ANSI.green;
}
function speedColor(responseTime) {
    const durationMs = Number(responseTime ?? 0);
    if (durationMs >= 1000) {
        return ANSI.red;
    }
    if (durationMs >= 500) {
        return ANSI.yellow;
    }
    return ANSI.green;
}
function createRequestLogger() {
    if (env_1.env.NODE_ENV === 'production') {
        return (0, morgan_1.default)((tokens, req, res) => JSON.stringify({
            timestamp: tokens['iso-date'](req, res),
            type: 'request',
            requestId: tokens['request-id'](req, res),
            method: tokens.method(req, res),
            path: tokens.url(req, res),
            status: Number(tokens.status(req, res) ?? 0),
            durationMs: Number(tokens['response-time'](req, res) ?? 0),
            responseSize: tokens.res(req, res, 'content-length') ?? '0',
            user: tokens['user-email'](req, res),
            role: tokens['user-role'](req, res),
        }), {
            skip: (req) => shouldSkip(asRequest(req).path),
        });
    }
    return (0, morgan_1.default)((tokens, req, res) => {
        const request = asRequest(req);
        const method = tokens.method(req, res) ?? 'GET';
        const path = tokens.url(req, res)?.split('?')[0] ?? request.path ?? '-';
        const status = tokens.status(req, res) ?? '000';
        const statusCode = Number(status);
        const responseTime = tokens['response-time'](req, res);
        return [
            colorize(`[${shortTimestamp()}]`, ANSI.dim),
            method,
            colorize(path, ANSI.cyan),
            colorize(status, statusColor(statusCode)),
            colorize(durationLabel(responseTime), speedColor(responseTime)),
            colorize(`req=${shortRequestId(request.requestId)}`, ANSI.dim),
            `actor=${actorLabel(request)}`,
        ].join(' ') + performanceFlag(responseTime) + summarizeQuery(request);
    }, {
        skip: (req) => shouldSkip(asRequest(req).path),
    });
}
