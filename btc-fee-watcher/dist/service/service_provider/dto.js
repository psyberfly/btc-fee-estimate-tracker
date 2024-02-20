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
exports.handleGetIndexHistory = exports.handleGetIndex = void 0;
const winston_1 = require("../../lib/logger/winston");
const handler_1 = require("../../lib/http/handler");
const service_provider_1 = require("./service_provider");
const serviceProvider = new service_provider_1.ServiceProvider();
function handleGetIndex(req, res) {
    return __awaiter(this, void 0, void 0, function* () {
        const request = (0, handler_1.parseRequest)(req);
        try {
            let index = yield serviceProvider.getIndex();
            if (index instanceof Error) {
                throw index;
            }
            yield (0, handler_1.respond)(200, index, res, request);
        }
        catch (e) {
            const result = (0, handler_1.filterError)(e, winston_1.r_500, request);
            yield (0, handler_1.respond)(result.code, result.message, res, request);
        }
    });
}
exports.handleGetIndex = handleGetIndex;
function handleGetIndexHistory(req, res) {
    return __awaiter(this, void 0, void 0, function* () {
        const request = (0, handler_1.parseRequest)(req);
        try {
            let indexView = yield serviceProvider.getIndexHistory();
            if (indexView instanceof Error) {
                throw indexView;
            }
            res.send(indexView);
            //    await respond(200, indexView, res, request);
        }
        catch (e) {
            const result = (0, handler_1.filterError)(e, winston_1.r_500, request);
            yield (0, handler_1.respond)(result.code, result.message, res, request);
        }
    });
}
exports.handleGetIndexHistory = handleGetIndexHistory;
//# sourceMappingURL=dto.js.map