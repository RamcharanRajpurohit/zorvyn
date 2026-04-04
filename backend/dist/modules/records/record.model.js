"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.RecordModel = void 0;
const mongoose_1 = require("mongoose");
const recordSchema = new mongoose_1.Schema({
    amount: {
        type: Number,
        required: true,
        min: 0,
    },
    type: {
        type: String,
        enum: ['income', 'expense'],
        required: true,
    },
    category: {
        type: String,
        required: true,
        trim: true,
        maxlength: 80,
    },
    occurredAt: {
        type: Date,
        required: true,
    },
    notes: {
        type: String,
        default: '',
        trim: true,
        maxlength: 500,
    },
    createdBy: {
        type: mongoose_1.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
    },
    updatedBy: {
        type: mongoose_1.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
    },
    isDeleted: {
        type: Boolean,
        default: false,
    },
}, {
    timestamps: true,
    versionKey: false,
});
recordSchema.index({ isDeleted: 1, occurredAt: -1 });
recordSchema.index({ type: 1, category: 1, occurredAt: -1 });
recordSchema.index({ createdBy: 1, occurredAt: -1 });
exports.RecordModel = mongoose_1.models.Record || (0, mongoose_1.model)('Record', recordSchema);
