"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.logger = void 0;
const env_1 = require("../config/env");
const ANSI = {
    reset: '\x1b[0m',
    dim: '\x1b[2m',
    blue: '\x1b[34m',
    yellow: '\x1b[33m',
    red: '\x1b[31m',
};
function colorize(text, color) {
    return `${color}${text}${ANSI.reset}`;
}
function formatMeta(meta) {
    return Object.entries(meta)
        .filter(([, value]) => value !== undefined)
        .map(([key, value]) => {
        if (typeof value === 'string') {
            return `${key}="${value}"`;
        }
        return `${key}=${JSON.stringify(value)}`;
    })
        .join(' ');
}
function write(level, message, meta = {}) {
    const timestamp = new Date().toISOString();
    if (env_1.env.NODE_ENV === 'production') {
        const payload = {
            timestamp,
            level,
            message,
            ...meta,
        };
        console[level === 'error' ? 'error' : 'log'](JSON.stringify(payload));
        return;
    }
    const metaText = formatMeta(meta);
    const levelLabel = level === 'error'
        ? colorize(level.toUpperCase(), ANSI.red)
        : level === 'warn'
            ? colorize(level.toUpperCase(), ANSI.yellow)
            : colorize(level.toUpperCase(), ANSI.blue);
    const line = `${colorize(`[${timestamp}]`, ANSI.dim)} ${levelLabel} ${message}${metaText ? ` ${metaText}` : ''}`;
    console[level === 'error' ? 'error' : 'log'](line);
}
exports.logger = {
    info(message, meta) {
        write('info', message, meta);
    },
    warn(message, meta) {
        write('warn', message, meta);
    },
    error(message, meta) {
        write('error', message, meta);
    },
};
