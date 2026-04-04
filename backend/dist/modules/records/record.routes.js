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
const express_1 = require("express");
const async_handler_1 = require("../../utils/async-handler");
const authorize_1 = require("../../middleware/authorize");
const validate_request_1 = require("../../middleware/validate-request");
const recordController = __importStar(require("./record.controller"));
const record_schema_1 = require("./record.schema");
const router = (0, express_1.Router)();
router.get('/', (0, authorize_1.authorize)('admin', 'analyst'), (0, validate_request_1.validateRequest)({ query: record_schema_1.listRecordQuerySchema }), (0, async_handler_1.asyncHandler)(recordController.listRecords));
router.post('/', (0, authorize_1.authorize)('admin'), (0, validate_request_1.validateRequest)({ body: record_schema_1.createRecordSchema }), (0, async_handler_1.asyncHandler)(recordController.createRecord));
router.get('/:id', (0, authorize_1.authorize)('admin', 'analyst'), (0, validate_request_1.validateRequest)({ params: record_schema_1.recordIdParamSchema }), (0, async_handler_1.asyncHandler)(recordController.getRecordById));
router.patch('/:id', (0, authorize_1.authorize)('admin'), (0, validate_request_1.validateRequest)({ params: record_schema_1.recordIdParamSchema, body: record_schema_1.updateRecordSchema }), (0, async_handler_1.asyncHandler)(recordController.updateRecord));
router.delete('/:id', (0, authorize_1.authorize)('admin'), (0, validate_request_1.validateRequest)({ params: record_schema_1.recordIdParamSchema }), (0, async_handler_1.asyncHandler)(recordController.deleteRecord));
exports.default = router;
