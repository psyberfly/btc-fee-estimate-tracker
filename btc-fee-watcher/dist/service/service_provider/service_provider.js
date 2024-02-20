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
exports.ServiceProvider = void 0;
const e_1 = require("../../lib/errors/e");
const fee_index_1 = require("../../op/fee_index/fee_index");
class ServiceProvider {
    constructor() {
        this.indexOp = new fee_index_1.IndexOp();
    }
    getIndex() {
        return __awaiter(this, void 0, void 0, function* () {
            const index = yield this.indexOp.readLatest();
            if (index instanceof Error) {
                return (0, e_1.handleError)(index);
            }
            return index;
        });
    }
    getIndexHistory() {
        return __awaiter(this, void 0, void 0, function* () {
            //WIP: 30 day index chart. Later, include all datasets to be charted, or make multiple functions for each chart:
            try {
                const allIndex = yield this.indexOp.readAll();
                if (allIndex instanceof Error) {
                    return (0, e_1.handleError)(allIndex);
                }
                return allIndex;
            }
            catch (e) {
                return (0, e_1.handleError)(e);
            }
        });
    }
}
exports.ServiceProvider = ServiceProvider;
//# sourceMappingURL=service_provider.js.map