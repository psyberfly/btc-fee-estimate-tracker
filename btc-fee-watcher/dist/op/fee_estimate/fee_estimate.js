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
exports.FeeOp = void 0;
const date_1 = require("../../lib/date/date");
// import { FeeEstPgStore } from "./store/pg";
const network_1 = require("../../lib/network/network");
const e_1 = require("../../lib/errors/e");
const prisma_1 = require("./store/prisma");
class FeeOp {
    constructor() {
        this.mempoolApiUrl = "https://mempool.space/api/v1/fees/recommended";
        // private store = new FeeEstPgStore();
        this.store = new prisma_1.FeeEstimatePrismaStore();
    }
    readLatest() {
        return __awaiter(this, void 0, void 0, function* () {
            const res = yield this.store.readLatest();
            return res;
        });
    }
    readLast365Days() {
        return __awaiter(this, void 0, void 0, function* () {
            const today = (0, date_1.fetchDate)(date_1.UTCDate.today);
            const lastYear = (0, date_1.fetchDate)(date_1.UTCDate.lastYear);
            const res = yield this.store.readByRange(lastYear, today);
            return res;
        });
    }
    readLast30Days() {
        return __awaiter(this, void 0, void 0, function* () {
            const today = (0, date_1.fetchDate)(date_1.UTCDate.today);
            const lastMonth = (0, date_1.fetchDate)(date_1.UTCDate.lastMonth);
            const res = yield this.store.readByRange(lastMonth, today);
            return res;
        });
    }
    updateCurrent() {
        return __awaiter(this, void 0, void 0, function* () {
            const res = yield (0, network_1.makeApiCall)(this.mempoolApiUrl, "GET");
            if (res instanceof Error) {
                console.error("Error fetching fee estimate from API!");
                return (0, e_1.handleError)(res);
            }
            const satsPerByte = res["fastestFee"];
            if (!satsPerByte) {
                return (0, e_1.handleError)({
                    code: 404,
                    message: "Null Fee Estimate fetched from API",
                });
            }
            const currentfeeEstimate = {
                time: new Date(),
                satsPerByte: satsPerByte,
                id: null, //Added by DB,
            };
            const isUpdated = yield this.store.insert(currentfeeEstimate);
            if (isUpdated instanceof Error) {
                return (0, e_1.handleError)(isUpdated);
            }
            return true;
        });
    }
}
exports.FeeOp = FeeOp;
//# sourceMappingURL=fee_estimate.js.map