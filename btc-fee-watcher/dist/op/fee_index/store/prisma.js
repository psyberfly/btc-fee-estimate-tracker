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
exports.FeeIndexPrismaStore = void 0;
const e_1 = require("../../../lib/errors/e");
const main_1 = require("../../../main");
class FeeIndexPrismaStore {
    fetchLatest() {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const latestIndex = yield main_1.prisma.feeIndex.findFirst({
                    orderBy: { createdAt: "desc" },
                    include: {
                        feeEstimate: true,
                        movingAverage: true,
                    },
                });
                const latestIndexRes = {
                    timestamp: latestIndex.createdAt,
                    feeEstimateMovingAverageRatio: {
                        last365Days: latestIndex.ratioLast365Days.toNumber(),
                        last30Days: latestIndex.ratioLast30Days.toNumber(),
                    },
                    currentFeeEstimate: {
                        satsPerByte: latestIndex.feeEstimate.satsPerByte.toNumber(),
                    },
                    movingAverage: {
                        createdAt: latestIndex.movingAverage.createdAt,
                        last365Days: latestIndex.movingAverage.last365Days.toNumber(),
                        last30Days: latestIndex.movingAverage.last30Days.toNumber(),
                    },
                };
                return latestIndexRes;
            }
            catch (error) {
                return (0, e_1.handleError)(error);
            }
        });
    }
    fetchAll() {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const allIndex = yield main_1.prisma.feeIndex.findMany({
                    orderBy: { createdAt: "desc" },
                    include: {
                        feeEstimate: true,
                        movingAverage: true,
                    },
                });
                let allIndexRes = [];
                allIndex.forEach((index) => {
                    const indexRes = {
                        timestamp: index.createdAt,
                        feeEstimateMovingAverageRatio: {
                            last365Days: index.ratioLast365Days.toNumber(),
                            last30Days: index.ratioLast30Days.toNumber(),
                        },
                        currentFeeEstimate: {
                            satsPerByte: index.feeEstimate.satsPerByte.toNumber(),
                        },
                        movingAverage: {
                            createdAt: index.movingAverage.createdAt,
                            last365Days: index.movingAverage.last365Days.toNumber(),
                            last30Days: index.movingAverage.last30Days.toNumber(),
                        },
                    };
                    allIndexRes.push(indexRes);
                });
                return allIndexRes;
            }
            catch (error) {
                return (0, e_1.handleError)(error);
            }
        });
    }
    insert(index) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                yield main_1.prisma.feeIndex.create({
                    data: {
                        feeEstimateId: index.feeEstimateId,
                        movingAverageId: index.movingAverageId,
                        ratioLast365Days: index.ratioLast365Days,
                        ratioLast30Days: index.ratioLast30Days,
                    },
                });
                return true;
            }
            catch (error) {
                return (0, e_1.handleError)(error);
            }
        });
    }
}
exports.FeeIndexPrismaStore = FeeIndexPrismaStore;
//# sourceMappingURL=prisma.js.map