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
exports.WatcherService = void 0;
const fee_history_1 = require("../fee_history/fee_history");
const moving_average_1 = require("../moving_average/moving_average");
class WatcherService {
    constructor() {
        this.movingAverage = new moving_average_1.MovingAverageService();
        this.feeHistorySerivce = new fee_history_1.FeeHistoryService();
    }
    getFeeRatio() {
        return __awaiter(this, void 0, void 0, function* () {
            //fetch curent btc fee from db?
            const currentFee = yield this.feeHistorySerivce.getCurrent();
            if (currentFee instanceof Error) {
                return currentFee;
            }
            const currentFeeRate = currentFee.satsPerByte;
            const yearlyMovingAverage = yield this.movingAverage.get();
            if (yearlyMovingAverage instanceof Error) {
                return yearlyMovingAverage;
            }
            const ratioCurrentToYearly = currentFeeRate / yearlyMovingAverage.yearly;
            const monthlyMovingAverage = yield this.movingAverage.get();
            if (monthlyMovingAverage instanceof Error) {
                return monthlyMovingAverage;
            }
            const ratioCurrentToMonthly = currentFeeRate / monthlyMovingAverage.monthly;
            const feeRatio = {
                timestamp: currentFee.time,
                currentToYearly: ratioCurrentToYearly,
                currentToMonthly: ratioCurrentToMonthly,
            };
            return feeRatio;
        });
    }
}
exports.WatcherService = WatcherService;
//# sourceMappingURL=watcher.js.map