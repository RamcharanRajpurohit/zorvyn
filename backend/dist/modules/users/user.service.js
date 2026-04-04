"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.createUser = createUser;
exports.listUsers = listUsers;
exports.getUserById = getUserById;
exports.updateUser = updateUser;
const bcryptjs_1 = __importDefault(require("bcryptjs"));
const mongoose_1 = __importDefault(require("mongoose"));
const env_1 = require("../../config/env");
const api_error_1 = require("../../utils/api-error");
const user_model_1 = require("./user.model");
const auth_session_model_1 = require("../auth/auth-session.model");
function toPublicUser(user) {
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
async function ensureEmailIsAvailable(email, excludeUserId) {
    const existing = await user_model_1.UserModel.findOne({
        email,
        ...(excludeUserId ? { _id: { $ne: excludeUserId } } : {}),
    });
    if (existing) {
        throw new api_error_1.ApiError(409, 'Email is already in use');
    }
}
function ensureObjectId(id, entityName) {
    if (!mongoose_1.default.isValidObjectId(id)) {
        throw new api_error_1.ApiError(400, `Invalid ${entityName} id`);
    }
}
async function createUser(payload) {
    await ensureEmailIsAvailable(payload.email);
    const passwordHash = await bcryptjs_1.default.hash(payload.password, env_1.env.BCRYPT_SALT_ROUNDS);
    const user = await user_model_1.UserModel.create({
        name: payload.name,
        email: payload.email,
        passwordHash,
        role: payload.role,
        status: payload.status,
    });
    return toPublicUser(user);
}
async function listUsers(query) {
    const filter = {};
    if (query.role)
        filter.role = query.role;
    if (query.status)
        filter.status = query.status;
    if (query.search) {
        filter.$or = [
            { name: { $regex: query.search, $options: 'i' } },
            { email: { $regex: query.search, $options: 'i' } },
        ];
    }
    const skip = (query.page - 1) * query.limit;
    const [users, total] = await Promise.all([
        user_model_1.UserModel.find(filter).sort({ createdAt: -1 }).skip(skip).limit(query.limit).lean(),
        user_model_1.UserModel.countDocuments(filter),
    ]);
    return {
        items: users.map(toPublicUser),
        pagination: {
            page: query.page,
            limit: query.limit,
            total,
            totalPages: Math.ceil(total / query.limit),
        },
    };
}
async function getUserById(id) {
    ensureObjectId(id, 'user');
    const user = await user_model_1.UserModel.findById(id).lean();
    if (!user) {
        throw new api_error_1.ApiError(404, 'User not found');
    }
    return toPublicUser(user);
}
async function updateUser(id, payload, actorId) {
    ensureObjectId(id, 'user');
    const user = await user_model_1.UserModel.findById(id).select('+passwordHash');
    if (!user) {
        throw new api_error_1.ApiError(404, 'User not found');
    }
    if (payload.email && payload.email !== user.email) {
        await ensureEmailIsAvailable(payload.email, id);
        user.email = payload.email;
    }
    const nextRole = payload.role ?? user.role;
    const nextStatus = payload.status ?? user.status;
    const isRemovingAdminAccess = user.role === 'admin' &&
        user.status === 'active' &&
        (nextRole !== 'admin' || nextStatus !== 'active');
    if (isRemovingAdminAccess) {
        const activeAdminCount = await user_model_1.UserModel.countDocuments({ role: 'admin', status: 'active' });
        if (activeAdminCount <= 1) {
            throw new api_error_1.ApiError(400, 'You cannot remove access from the last active admin');
        }
    }
    if (payload.name)
        user.name = payload.name;
    if (payload.role)
        user.role = payload.role;
    if (payload.status) {
        if (actorId === id && payload.status === 'inactive') {
            throw new api_error_1.ApiError(400, 'You cannot deactivate your own account');
        }
        user.status = payload.status;
    }
    if (payload.password) {
        user.passwordHash = await bcryptjs_1.default.hash(payload.password, env_1.env.BCRYPT_SALT_ROUNDS);
    }
    await user.save();
    if (payload.email || payload.password || payload.role || payload.status) {
        await auth_session_model_1.AuthSessionModel.updateMany({
            user: id,
            revokedAt: null,
        }, {
            $set: {
                revokedAt: new Date(),
            },
        });
    }
    return getUserById(id);
}
