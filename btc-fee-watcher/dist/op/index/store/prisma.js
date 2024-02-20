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
    readLatest() {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const latest = yield main_1.prisma.feeIndex.findFirst({
                    orderBy: { createdAt: "desc" },
                    include: {
                        feeEstimate: true,
                        movingAverage: true,
                    },
                });
                // const feeIndexLatest: FeeIndex = {
                //   id: latest.id,
                //   feeEstimateId: latest.feeEstimateId,
                //   movingAverageId: latest.movingAverageId,
                //   ratioLast365Days: latest.ratioLast365Days,
                //   ratioLast30Days: latest.ratioLast30Days,
                //   createdAt: latest.createdAt,
                // };
                //return feeIndexLatest;
                return latest;
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