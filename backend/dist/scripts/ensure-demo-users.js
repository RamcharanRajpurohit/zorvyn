"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const bcryptjs_1 = __importDefault(require("bcryptjs"));
const db_1 = require("../config/db");
const env_1 = require("../config/env");
const user_model_1 = require("../modules/users/user.model");
const demoUsers = [
    {
        name: 'Admin User',
        email: 'admin@walletwhiz.dev',
        role: 'admin',
        status: 'active',
        password: 'password123',
    },
    {
        name: 'Analyst User',
        email: 'analyst@walletwhiz.dev',
        role: 'analyst',
        status: 'active',
        password: 'password123',
    },
    {
        name: 'Viewer User',
        email: 'viewer@walletwhiz.dev',
        role: 'viewer',
        status: 'active',
        password: 'password123',
    },
];
async function run() {
    await (0, db_1.connectDatabase)();
    for (const user of demoUsers) {
        const passwordHash = await bcryptjs_1.default.hash(user.password, env_1.env.BCRYPT_SALT_ROUNDS);
        await user_model_1.UserModel.findOneAndUpdate({ email: user.email }, {
            name: user.name,
            email: user.email,
            role: user.role,
            status: user.status,
            passwordHash,
        }, {
            upsert: true,
            new: true,
            setDefaultsOnInsert: true,
        });
    }
    const users = await user_model_1.UserModel.find({}, 'name email role status').sort({ role: 1, email: 1 }).lean();
    console.log('Demo users ensured:');
    console.log(JSON.stringify(users, null, 2));
}
void run()
    .catch((error) => {
    console.error('Failed to ensure demo users', error);
    process.exitCode = 1;
})
    .finally(async () => {
    await (0, db_1.disconnectDatabase)();
});
