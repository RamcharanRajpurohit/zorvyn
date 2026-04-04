"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.revokeSessionsForUser = revokeSessionsForUser;
exports.bootstrapAdmin = bootstrapAdmin;
exports.login = login;
exports.refreshSession = refreshSession;
exports.logout = logout;
const bcryptjs_1 = __importDefault(require("bcryptjs"));
const crypto_1 = require("crypto");
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const env_1 = require("../../config/env");
const api_error_1 = require("../../utils/api-error");
const user_model_1 = require("../users/user.model");
const user_service_1 = require("../users/user.service");
const auth_session_model_1 = require("./auth-session.model");
function signAccessToken(user) {
    return jsonwebtoken_1.default.sign({
        role: user.role,
        email: user.email,
    }, env_1.env.JWT_SECRET, {
        subject: user.id,
        expiresIn: env_1.env.JWT_EXPIRES_IN,
    });
}
function mapUser(user) {
    return {
        id: user._id.toString(),
        name: user.name,
        email: user.email,
        role: user.role,
        status: user.status,
        lastLoginAt: user.lastLoginAt ?? null,
        createdAt: user.createdAt,
        updatedAt: user.updatedAt,
    };
}
function hashRefreshToken(refreshToken) {
    return (0, crypto_1.createHash)('sha256').update(refreshToken).digest('hex');
}
function createRefreshToken() {
    return (0, crypto_1.randomBytes)(48).toString('base64url');
}
function refreshExpiryDate() {
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + env_1.env.REFRESH_TOKEN_TTL_DAYS);
    return expiresAt;
}
async function issueAuthSession(user, meta) {
    const refreshToken = createRefreshToken();
    const refreshTokenHash = hashRefreshToken(refreshToken);
    const session = await auth_session_model_1.AuthSessionModel.create({
        user: user._id,
        refreshTokenHash,
        expiresAt: refreshExpiryDate(),
        userAgent: meta.userAgent ?? '',
        ipAddress: meta.ipAddress ?? '',
        lastUsedAt: new Date(),
        lastUsedIp: meta.ipAddress ?? '',
    });
    const accessToken = signAccessToken({
        id: user._id.toString(),
        role: user.role,
        email: user.email,
    });
    return {
        token: accessToken,
        accessToken,
        refreshToken,
        sessionId: session._id.toString(),
        sessionObjectId: session._id,
        user: mapUser(user),
    };
}
async function revokeSessionsForUser(userId) {
    await auth_session_model_1.AuthSessionModel.updateMany({
        user: userId,
        revokedAt: null,
    }, {
        $set: {
            revokedAt: new Date(),
        },
    });
}
async function bootstrapAdmin(payload, meta) {
    const existingUsers = await user_model_1.UserModel.countDocuments();
    if (existingUsers > 0) {
        throw new api_error_1.ApiError(403, 'Bootstrap is only allowed when the system has no users');
    }
    const admin = await (0, user_service_1.createUser)({
        ...payload,
        role: 'admin',
        status: 'active',
    });
    const adminRecord = await user_model_1.UserModel.findById(admin.id);
    if (!adminRecord) {
        throw new api_error_1.ApiError(500, 'Admin was created but could not be loaded');
    }
    const { sessionObjectId: _sessionObjectId, ...result } = await issueAuthSession(adminRecord, meta);
    return result;
}
async function login(payload, meta) {
    const user = await user_model_1.UserModel.findOne({ email: payload.email }).select('+passwordHash');
    if (!user) {
        throw new api_error_1.ApiError(401, 'Invalid email or password');
    }
    if (user.status !== 'active') {
        throw new api_error_1.ApiError(403, 'Your account is inactive');
    }
    const passwordMatches = await bcryptjs_1.default.compare(payload.password, user.passwordHash);
    if (!passwordMatches) {
        throw new api_error_1.ApiError(401, 'Invalid email or password');
    }
    user.lastLoginAt = new Date();
    await user.save();
    const { sessionObjectId: _sessionObjectId, ...result } = await issueAuthSession(user, meta);
    return result;
}
async function refreshSession(payload, meta) {
    const refreshTokenHash = hashRefreshToken(payload.refreshToken);
    const currentSession = await auth_session_model_1.AuthSessionModel.findOne({
        refreshTokenHash,
    });
    if (!currentSession || currentSession.revokedAt) {
        throw new api_error_1.ApiError(401, 'Refresh token is invalid');
    }
    if (currentSession.expiresAt.getTime() <= Date.now()) {
        currentSession.revokedAt = new Date();
        currentSession.lastUsedAt = new Date();
        await currentSession.save();
        throw new api_error_1.ApiError(401, 'Refresh token has expired');
    }
    const user = await user_model_1.UserModel.findById(currentSession.user);
    if (!user) {
        currentSession.revokedAt = new Date();
        await currentSession.save();
        throw new api_error_1.ApiError(401, 'User linked to this session no longer exists');
    }
    if (user.status !== 'active') {
        currentSession.revokedAt = new Date();
        await currentSession.save();
        throw new api_error_1.ApiError(403, 'This account is inactive');
    }
    const nextSession = await issueAuthSession(user, meta);
    currentSession.revokedAt = new Date();
    currentSession.lastUsedAt = new Date();
    currentSession.lastUsedIp = meta.ipAddress ?? currentSession.lastUsedIp;
    await currentSession.save();
    const { sessionObjectId: _sessionObjectId, ...result } = nextSession;
    return result;
}
async function logout(payload) {
    const refreshTokenHash = hashRefreshToken(payload.refreshToken);
    const currentSession = await auth_session_model_1.AuthSessionModel.findOne({
        refreshTokenHash,
    });
    if (!currentSession) {
        return;
    }
    if (!currentSession.revokedAt) {
        currentSession.revokedAt = new Date();
        currentSession.lastUsedAt = new Date();
        await currentSession.save();
    }
}
