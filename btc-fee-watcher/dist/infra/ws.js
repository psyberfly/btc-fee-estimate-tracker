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
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AlertStreamServer = void 0;
const express_1 = __importDefault(require("express"));
const ws_1 = require("ws");
const router_1 = require("../service/service_provider/router");
const http_1 = __importDefault(require("http"));
const dotenv = __importStar(require("dotenv"));
const e_1 = require("../lib/errors/e");
dotenv.config();
class AlertStreamServer {
    constructor(port, path) {
        this.port = port;
        this.path = path;
        AlertStreamServer.initAlertStream(this.port, this.path);
    }
    static initAlertStream(port, path) {
        try {
            const app = (0, express_1.default)();
            const server = http_1.default.createServer(app);
            AlertStreamServer.alertStreamServer = new ws_1.Server({
                server,
                path,
            });
            function broadcastAlert(data) {
                AlertStreamServer.alertStreamServer.clients.forEach((client) => {
                    client.send(data);
                });
            }
            AlertStreamServer.alertStreamServer.on("connection", (client, req) => {
                console.log("WS connection opened");
                const servicePath = req.url.split("?service=")[1];
                //Currently we broadcast to all subscribers if they stream to the offered service, since only 1 service is offered.
                //When upgrading to multiple services, attach tag to the client: client["service"]="index" and filter by tag in broadcastAlert
                if (servicePath !== router_1.alertStreamPath) {
                    client.send("Error: 404; Message: Service not found. Please check the service you want to stream.");
                    client.close();
                }
                client.send("Hello from BTC Fee Watcher! You are now streaming our index...");
                client.on("message", (message) => {
                    console.log("WS message received:", message.toString());
                });
                client.on("error", (message) => {
                    console.error("WS connection error:", message);
                });
                client.on("close", (message) => {
                    console.log("WS connection closed");
                });
            });
            AlertStreamServer.alertStreamServer.on("error", (error) => {
                console.error("WS Error:", error);
            });
            server.listen(port, () => {
                console.log(`WS Server running on port ${port}`);
            });
        }
        catch (error) {
            console.error("Error starting WS Server:", error);
            process.exit(1);
        }
    }
    broadcastAlert(data) {
        try {
            // Broadcast to all connected clients
            AlertStreamServer.alertStreamServer.clients.forEach((client) => {
                client.send(JSON.stringify(data));
            });
        }
        catch (e) {
            console.error("AlertStreamServer: Error during broadcast!");
            return (0, e_1.handleError)(e);
        }
        return true;
    }
}
exports.AlertStreamServer = AlertStreamServer;
//# sourceMappingURL=ws.js.map