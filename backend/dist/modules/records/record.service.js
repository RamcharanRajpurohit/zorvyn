"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.createRecord = createRecord;
exports.listRecords = listRecords;
exports.getRecordById = getRecordById;
exports.updateRecord = updateRecord;
exports.deleteRecord = deleteRecord;
const mongoose_1 = __importDefault(require("mongoose"));
const api_error_1 = require("../../utils/api-error");
const record_model_1 = require("./record.model");
function ensureObjectId(id, entityName) {
    if (!mongoose_1.default.isValidObjectId(id)) {
        throw new api_error_1.ApiError(400, `Invalid ${entityName} id`);
    }
}
function mapActor(actor) {
    if (typeof actor === 'object' && actor !== null && '_id' in actor && actor._id) {
        return {
            id: actor._id.toString(),
            name: actor.name,
            email: actor.email,
        };
    }
    return { id: actor.toString() };
}
function mapRecord(record) {
    return {
        id: record._id.toString(),
        amount: record.amount,
        type: record.type,
        category: record.category,
        occurredAt: record.occurredAt,
        notes: record.notes ?? '',
        createdBy: mapActor(record.createdBy),
        updatedBy: mapActor(record.updatedBy),
        createdAt: record.createdAt,
        updatedAt: record.updatedAt,
    };
}
async function createRecord(payload, actorId) {
    ensureObjectId(actorId, 'user');
    const record = await record_model_1.RecordModel.create({
        ...payload,
        createdBy: actorId,
        updatedBy: actorId,
    });
    return mapRecord(record);
}
async function listRecords(query) {
    const filter = { isDeleted: false };
    if (query.type)
        filter.type = query.type;
    if (query.category)
        filter.category = query.category;
    if (query.search)
        filter.notes = { $regex: query.search, $options: 'i' };
    if (query.from || query.to) {
        filter.occurredAt = {
            ...(query.from ? { $gte: query.from } : {}),
            ...(query.to ? { $lte: query.to } : {}),
        };
    }
    const sortDirection = query.sortOrder === 'asc' ? 1 : -1;
    const skip = (query.page - 1) * query.limit;
    const [items, total] = await Promise.all([
        record_model_1.RecordModel.find(filter)
            .sort({ [query.sortBy]: sortDirection })
            .skip(skip)
            .limit(query.limit)
            .populate('createdBy', 'name email')
            .populate('updatedBy', 'name email')
            .lean(),
        record_model_1.RecordModel.countDocuments(filter),
    ]);
    return {
        items: items.map((item) => mapRecord(item)),
        pagination: {
            page: query.page,
            limit: query.limit,
            total,
            totalPages: Math.ceil(total / query.limit),
        },
    };
}
async function getRecordById(id) {
    ensureObjectId(id, 'record');
    const record = await record_model_1.RecordModel.findOne({ _id: id, isDeleted: false })
        .populate('createdBy', 'name email')
        .populate('updatedBy', 'name email')
        .lean();
    if (!record) {
        throw new api_error_1.ApiError(404, 'Record not found');
    }
    return mapRecord(record);
}
async function updateRecord(id, payload, actorId) {
    ensureObjectId(id, 'record');
    ensureObjectId(actorId, 'user');
    const record = await record_model_1.RecordModel.findOneAndUpdate({ _id: id, isDeleted: false }, {
        ...payload,
        updatedBy: actorId,
    }, {
        new: true,
        runValidators: true,
    })
        .populate('createdBy', 'name email')
        .populate('updatedBy', 'name email')
        .lean();
    if (!record) {
        throw new api_error_1.ApiError(404, 'Record not found');
    }
    return mapRecord(record);
}
async function deleteRecord(id, actorId) {
    ensureObjectId(id, 'record');
    ensureObjectId(actorId, 'user');
    const record = await record_model_1.RecordModel.findOneAndUpdate({ _id: id, isDeleted: false }, {
        isDeleted: true,
        updatedBy: actorId,
    }, { new: true });
    if (!record) {
        throw new api_error_1.ApiError(404, 'Record not found');
    }
    return {
        id: record._id.toString(),
        deleted: true,
    };
}
