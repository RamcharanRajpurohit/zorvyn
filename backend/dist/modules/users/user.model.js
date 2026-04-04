"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.UserModel = void 0;
const mongoose_1 = require("mongoose");
const roles_1 = require("../../constants/roles");
const userSchema = new mongoose_1.Schema({
    name: {
        type: String,
        required: true,
        trim: true,
        minlength: 2,
        maxlength: 80,
    },
    email: {
        type: String,
        required: true,
        unique: true,
        lowercase: true,
        trim: true,
    },
    passwordHash: {
        type: String,
        required: true,
        select: false,
    },
    role: {
        type: String,
        enum: roles_1.USER_ROLES,
        default: 'viewer',
        required: true,
    },
    status: {
        type: String,
        enum: roles_1.USER_STATUSES,
        default: 'active',
        required: true,
    },
    lastLoginAt: {
        type: Date,
        default: null,
    },
}, {
    timestamps: true,
    versionKey: false,
});
userSchema.index({ role: 1, status: 1 });
exports.UserModel = mongoose_1.models.User || (0, mongoose_1.model)('User', userSchema);
