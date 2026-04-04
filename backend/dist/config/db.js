"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.connectDatabase = connectDatabase;
exports.disconnectDatabase = disconnectDatabase;
const mongoose_1 = __importDefault(require("mongoose"));
const env_1 = require("./env");
async function connectDatabase() {
    await mongoose_1.default.connect(env_1.env.MONGODB_URI, {
        dbName: env_1.env.MONGODB_DB_NAME,
    });
}
async function disconnectDatabase() {
    await mongoose_1.default.disconnect();
}
