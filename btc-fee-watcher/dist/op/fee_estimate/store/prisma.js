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
exports.FeeEstimatePrismaStore = void 0;
const main_1 = require("../../../main");
const e_1 = require("../../../lib/errors/e");
class FeeEstimatePrismaStore {
    readLatest() {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const res = yield main_1.prisma.feeEstimate.findFirst({
                    orderBy: { time: "desc" },
                });
                const feeEstimateLatest = {
                    id: res.id,
                    time: res.time,
                    satsPerByte: res.satsPerByte,
                };
                return feeEstimateLatest;
            }
            catch (e) {
                return (0, e_1.handleError)(e);
            }
        });
    }
    insert(rowData) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                yield main_1.prisma.feeEstimate.create({
                    data: {
                        time: rowData.time,
                        satsPerByte: rowData.satsPerByte,
                    },
                });
                return true;
            }
            catch (error) {
                return (0, e_1.handleError)(error);
            }
        });
    }
    readByRange(fromDate, toDate) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const feeEstHistory = yield main_1.prisma.feeEstimate.findMany({
                    where: {
                        AND: [
                            { time: { gte: new Date(fromDate) } },
                            { time: { lte: new Date(toDate) } },
                        ],
                    },
                });
                return feeEstHistory.map((row) => ({
                    id: row.id,
                    time: row.time,
                    satsPerByte: row.satsPerByte,
                }));
            }
            catch (error) {
                return (0, e_1.handleError)(error);
            }
        });
    }
}
exports.FeeEstimatePrismaStore = FeeEstimatePrismaStore;
//# sourceMappingURL=prisma.js.map