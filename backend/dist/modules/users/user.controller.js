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
exports.createUser = createUser;
exports.listUsers = listUsers;
exports.getUserById = getUserById;
exports.updateUser = updateUser;
const api_response_1 = require("../../utils/api-response");
const userService = __importStar(require("./user.service"));
async function createUser(req, res) {
    const user = await userService.createUser(req.body);
    res.status(201).json((0, api_response_1.successResponse)(user, 'User created successfully'));
}
async function listUsers(req, res) {
    const users = await userService.listUsers(req.query);
    res.json((0, api_response_1.successResponse)(users, 'Users fetched successfully'));
}
async function getUserById(req, res) {
    const user = await userService.getUserById(req.params.id);
    res.json((0, api_response_1.successResponse)(user, 'User fetched successfully'));
}
async function updateUser(req, res) {
    const user = await userService.updateUser(req.params.id, req.body, req.user.id);
    res.json((0, api_response_1.successResponse)(user, 'User updated successfully'));
}
