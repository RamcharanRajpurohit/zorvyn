"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.authorize = authorize;
const api_error_1 = require("../utils/api-error");
function authorize(...roles) {
    return (req, _res, next) => {
        if (!req.user) {
            return next(new api_error_1.ApiError(401, 'Authentication is required'));
        }
        if (!roles.includes(req.user.role)) {
            return next(new api_error_1.ApiError(403, 'You do not have permission to perform this action'));
        }
        next();
    };
}
