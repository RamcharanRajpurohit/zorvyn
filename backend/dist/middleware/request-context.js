"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.attachRequestContext = attachRequestContext;
const crypto_1 = require("crypto");
function attachRequestContext(req, res, next) {
    const headerValue = req.header('x-request-id');
    const requestId = headerValue && headerValue.trim().length > 0 ? headerValue : (0, crypto_1.randomUUID)();
    req.requestId = requestId;
    res.setHeader('X-Request-Id', requestId);
    next();
}
