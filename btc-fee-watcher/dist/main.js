"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.prisma = void 0;
const server_1 = require("./infra/server");
const index_watcher_1 = require("./infra/index_watcher");
//import { initDB, PgStore } from "./infra/db";
const client_1 = require("@prisma/client");
exports.prisma = new client_1.PrismaClient();
function startService() {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            //await initDB();
            yield (0, server_1.runServer)();
            yield (0, index_watcher_1.runIndexWatcher)();
        }
        catch (error) {
            console.error(`Error running Service:${error}`);
            //  await PgStore.disconnectDb();
            yield exports.prisma.$disconnect();
            process.exit(1);
        }
    });
}
startService();
//# sourceMappingURL=main.js.map