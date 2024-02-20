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
exports.IndexOp = void 0;
const e_1 = require("../../lib/errors/e");
const fee_estimate_1 = require("../fee_estimate/fee_estimate");
const prisma_1 = require("./store/prisma");
const prisma_2 = require("../moving_average/store/prisma");
const prisma_3 = require("../fee_estimate/store/prisma");
const library_1 = require("@prisma/client/runtime/library");
//import { IndexStore } from "./store/pg";
class IndexOp {
    constructor() {
        this.feeOp = new fee_estimate_1.FeeOp();
        //private store = new IndexStore();
        // private feeEstStore = new FeeEstPgStore();
        // private movingAvgStore = new MovingAverageStore();
        this.store = new prisma_1.FeeIndexPrismaStore();
        this.movingAvgStore = new prisma_2.MovingAveragePrismaStore();
        this.feeEstStore = new prisma_3.FeeEstimatePrismaStore();
    }
    updateIndex(currentFee) {
        throw new Error("Method not implemented.");
    }
    readLatest() {
        return __awaiter(this, void 0, void 0, function* () {
            const index = yield this.store.readLatest();
            if (index instanceof Error) {
                return (0, e_1.handleError)(index);
            }
            return index;
        });
    }
    udpateIndex() {
        return __awaiter(this, void 0, void 0, function* () {
            const currentFeeEst = yield this.feeEstStore.readLatest();
            if (currentFeeEst instanceof Error) {
                return (0, e_1.handleError)(currentFeeEst);
            }
            const movingAvgToday = yield this.movingAvgStore.readLatest();
            if (movingAvgToday instanceof Error) {
                return (0, e_1.handleError)(movingAvgToday);
            }
            const ratioLast365Days = currentFeeEst.satsPerByte.toNumber() /
                movingAvgToday.last365Days.toNumber();
            const ratioLast30Days = currentFeeEst.satsPerByte.toNumber() /
                movingAvgToday.last30Days.toNumber();
            const index = {
                id: null,
                feeEstimateId: currentFeeEst.id,
                movingAverageId: movingAvgToday.id,
                ratioLast365Days: new library_1.Decimal(ratioLast365Days),
                ratioLast30Days: new library_1.Decimal(ratioLast30Days),
                createdAt: null, //added by DB
            };
            this.store.insert(index);
            return true;
        });
    }
}
exports.IndexOp = IndexOp;
//# sourceMappingURL=index.js.map