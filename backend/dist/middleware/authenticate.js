"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.authenticate = authenticate;
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const env_1 = require("../config/env");
const api_error_1 = require("../utils/api-error");
const user_model_1 = require("../modules/users/user.model");
async function authenticate(req, _res, next) {
    const authHeader = req.headers.authorization;
    if (!authHeader?.startsWith('Bearer ')) {
        return next(new api_error_1.ApiError(401, 'Authentication token is missing'));
    }
    const token = authHeader.slice(7);
    try {
        const payload = jsonwebtoken_1.default.verify(token, env_1.env.JWT_SECRET);
        const user = await user_model_1.UserModel.findById(payload.sub).lean();
        if (!user) {
            return next(new api_error_1.ApiError(401, 'User linked to this token no longer exists'));
        }
        if (user.status !== 'active') {
            return next(new api_error_1.ApiError(403, 'This account is inactive'));
        }
        req.user = {
            id: user._id.toString(),
            name: user.name,
            email: user.email,
            role: user.role,
            status: user.status,
        };
        next();
    }
    catch {
        next(new api_error_1.ApiError(401, 'Invalid or expired token'));
    }
}
