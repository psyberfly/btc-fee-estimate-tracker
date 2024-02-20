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
exports.MovingAveragePrismaStore = void 0;
const main_1 = require("../../../main");
const e_1 = require("../../../lib/errors/e");
class MovingAveragePrismaStore {
    readLatest() {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const movingAverage = yield main_1.prisma.movingAverage.findFirst({
                    orderBy: { createdAt: "desc" },
                });
                return movingAverage;
            }
            catch (error) {
                return (0, e_1.handleError)(error);
            }
        });
    }
    insert(movingAverage) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                yield main_1.prisma.movingAverage.create({
                    data: {
                        last365Days: movingAverage.last365Days,
                        last30Days: movingAverage.last30Days,
                    },
                });
                return true;
            }
            catch (error) {
                return (0, e_1.handleError)(error);
            }
        });
    }
    checkRowExistsByDate(dateUTC) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const count = yield main_1.prisma.movingAverage.count({
                    where: {
                        createdAt: {
                            equals: new Date(dateUTC),
                        },
                    },
                });
                return count > 0;
            }
            catch (error) {
                return (0, e_1.handleError)(error);
            }
        });
    }
}
exports.MovingAveragePrismaStore = MovingAveragePrismaStore;
//# sourceMappingURL=prisma.js.map