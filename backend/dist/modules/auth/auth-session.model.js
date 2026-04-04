"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AuthSessionModel = void 0;
const mongoose_1 = require("mongoose");
const authSessionSchema = new mongoose_1.Schema({
    user: {
        type: mongoose_1.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
        index: true,
    },
    refreshTokenHash: {
        type: String,
        required: true,
        unique: true,
        trim: true,
    },
    expiresAt: {
        type: Date,
        required: true,
        index: true,
    },
    revokedAt: {
        type: Date,
        default: null,
    },
    replacedBySession: {
        type: mongoose_1.Schema.Types.ObjectId,
        ref: 'AuthSession',
        default: null,
    },
    userAgent: {
        type: String,
        default: '',
        maxlength: 500,
    },
    ipAddress: {
        type: String,
        default: '',
        maxlength: 100,
    },
    lastUsedAt: {
        type: Date,
        default: null,
    },
    lastUsedIp: {
        type: String,
        default: '',
        maxlength: 100,
    },
}, {
    timestamps: true,
    versionKey: false,
});
authSessionSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });
authSessionSchema.index({ user: 1, revokedAt: 1, expiresAt: -1 });
exports.AuthSessionModel = mongoose_1.models.AuthSession ||
    (0, mongoose_1.model)('AuthSession', authSessionSchema);
