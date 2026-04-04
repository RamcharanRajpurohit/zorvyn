"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const node_http_1 = require("node:http");
const db_1 = require("./config/db");
const env_1 = require("./config/env");
const app_1 = require("./app");
async function startServer() {
    await (0, db_1.connectDatabase)();
    const app = (0, app_1.createApp)();
    const server = (0, node_http_1.createServer)(app);
    server.listen(env_1.env.PORT, () => {
        console.log(`Backend running on http://localhost:${env_1.env.PORT}`);
    });
}
void startServer().catch((error) => {
    console.error('Failed to start backend', error);
    process.exit(1);
});
