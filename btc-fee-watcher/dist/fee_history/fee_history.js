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
exports.FeeHistoryService = void 0;
const date_1 = require("../lib/date/date");
const pg_1 = require("./pg");
class FeeHistoryService {
    constructor() {
        this.store = new pg_1.FeeHistoryStore();
    }
    getCurrent() {
        return __awaiter(this, void 0, void 0, function* () {
            const res = yield this.store.readLatest();
            return res;
        });
    }
    getLastYear() {
        return __awaiter(this, void 0, void 0, function* () {
            const today = (0, date_1.fetchDate)(date_1.UTCDate.today);
            const lastYear = (0, date_1.fetchDate)(date_1.UTCDate.lastYear);
            const res = yield this.store.readByRange(lastYear, today);
            return res;
        });
    }
    getLastMonth() {
        return __awaiter(this, void 0, void 0, function* () {
            const today = (0, date_1.fetchDate)(date_1.UTCDate.today);
            const lastMonth = (0, date_1.fetchDate)(date_1.UTCDate.lastMonth);
            const res = yield this.store.readByRange(lastMonth, today);
            return res;
        });
    }
}
exports.FeeHistoryService = FeeHistoryService;
//# sourceMappingURL=fee_history.js.map