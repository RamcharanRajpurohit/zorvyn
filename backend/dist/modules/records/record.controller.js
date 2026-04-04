"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.createRecord = createRecord;
exports.listRecords = listRecords;
exports.getRecordById = getRecordById;
exports.updateRecord = updateRecord;
exports.deleteRecord = deleteRecord;
const api_response_1 = require("../../utils/api-response");
const recordService = __importStar(require("./record.service"));
async function createRecord(req, res) {
    const record = await recordService.createRecord(req.body, req.user.id);
    res.status(201).json((0, api_response_1.successResponse)(record, 'Record created successfully'));
}
async function listRecords(req, res) {
    const records = await recordService.listRecords(req.query);
    res.json((0, api_response_1.successResponse)(records, 'Records fetched successfully'));
}
async function getRecordById(req, res) {
    const record = await recordService.getRecordById(req.params.id);
    res.json((0, api_response_1.successResponse)(record, 'Record fetched successfully'));
}
async function updateRecord(req, res) {
    const record = await recordService.updateRecord(req.params.id, req.body, req.user.id);
    res.json((0, api_response_1.successResponse)(record, 'Record updated successfully'));
}
async function deleteRecord(req, res) {
    const result = await recordService.deleteRecord(req.params.id, req.user.id);
    res.json((0, api_response_1.successResponse)(result, 'Record deleted successfully'));
}
