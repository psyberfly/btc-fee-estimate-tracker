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
exports.MovingAverageOp = void 0;
const fee_estimate_1 = require("../fee_estimate/fee_estimate");
//import { MovingAverageStore } from "./store/pg";
const e_1 = require("../../lib/errors/e");
const library_1 = require("@prisma/client/runtime/library");
const prisma_1 = require("./store/prisma");
class MovingAverageOp {
    constructor() {
        this.feeOp = new fee_estimate_1.FeeOp();
        this.store = new prisma_1.MovingAveragePrismaStore();
    }
    readLatest() {
        return __awaiter(this, void 0, void 0, function* () {
            const latestMovingAvg = yield this.store.readLatest();
            if (latestMovingAvg instanceof Error) {
                return (0, e_1.handleError)(latestMovingAvg);
            }
            return latestMovingAvg;
        });
    }
    checkExists(dateUTC) {
        return __awaiter(this, void 0, void 0, function* () {
            const exists = yield this.store.checkRowExistsByDate(dateUTC);
            if (exists instanceof Error) {
                return (0, e_1.handleError)(exists);
            }
            return exists;
        });
    }
    create() {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const feeHistoryLastYear = yield this.feeOp.readLast365Days();
                if (feeHistoryLastYear instanceof Error) {
                    return feeHistoryLastYear;
                }
                if (feeHistoryLastYear.length === 0) {
                    throw new Error("Array is empty, cannot calculate average.");
                }
                const yearlySum = feeHistoryLastYear.reduce((acc, curr) => acc + curr.satsPerByte.toNumber(), 0);
                const yearlyAverage = yearlySum / feeHistoryLastYear.length;
                const feeHistoryLastMonth = yield this.feeOp.readLast30Days();
                if (feeHistoryLastMonth instanceof Error) {
                    return feeHistoryLastMonth;
                }
                if (feeHistoryLastMonth.length === 0) {
                    throw new Error("Array is empty, cannot calculate average.");
                }
                const monthlySum = feeHistoryLastMonth.reduce((acc, curr) => acc + curr.satsPerByte.toNumber(), 0);
                const monthlyAverage = monthlySum / feeHistoryLastYear.length;
                const update = {
                    id: null,
                    createdAt: null,
                    last365Days: new library_1.Decimal(yearlyAverage),
                    last30Days: new library_1.Decimal(monthlyAverage),
                };
                this.store.insert(update);
                return true;
            }
            catch (e) {
                return (0, e_1.handleError)(e);
            }
        });
    }
}
exports.MovingAverageOp = MovingAverageOp;
//# sourceMappingURL=moving_average.js.map