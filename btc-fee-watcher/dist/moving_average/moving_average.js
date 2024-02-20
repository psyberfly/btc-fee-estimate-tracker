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
exports.MovingAverageService = void 0;
const fee_history_1 = require("../fee_history/fee_history");
const pg_1 = require("./pg");
class MovingAverageService {
    constructor() {
        this.feeHistorySerivce = new fee_history_1.FeeHistoryService();
        this.store = new pg_1.MovingAverageStore();
    }
    get() {
        const res = this.store.read();
        return res;
    }
    update() {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const feeHistoryLastYear = yield this.feeHistorySerivce.getLastYear();
                if (feeHistoryLastYear instanceof Error) {
                    return feeHistoryLastYear;
                }
                if (feeHistoryLastYear.length === 0) {
                    throw new Error("Array is empty, cannot calculate average.");
                }
                const yearlySum = feeHistoryLastYear.reduce((acc, curr) => acc + curr.satsPerByte.valueOf(), 0);
                const yearlyAverage = yearlySum / feeHistoryLastYear.length;
                const feeHistoryLastMonth = yield this.feeHistorySerivce.getLastMonth();
                if (feeHistoryLastMonth instanceof Error) {
                    return feeHistoryLastMonth;
                }
                if (feeHistoryLastMonth.length === 0) {
                    throw new Error("Array is empty, cannot calculate average.");
                }
                const monthlySum = feeHistoryLastMonth.reduce((acc, curr) => acc + curr.satsPerByte.valueOf(), 0);
                const monthlyAverage = monthlySum / feeHistoryLastYear.length;
                const update = {
                    createdAt: new Date().toUTCString(),
                    yearly: yearlyAverage,
                    monthly: monthlyAverage,
                };
                this.store.update(update);
            }
            catch (e) {
                throw e;
            }
        });
    }
}
exports.MovingAverageService = MovingAverageService;
//# sourceMappingURL=moving_average.js.map