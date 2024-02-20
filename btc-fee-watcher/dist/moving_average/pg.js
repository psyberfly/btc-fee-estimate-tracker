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
exports.MovingAverageStore = void 0;
const pg_store_1 = require("../pg_store");
class MovingAverageStore {
    constructor() {
        this.tableName = "moving_average";
    }
    initTable() {
        return __awaiter(this, void 0, void 0, function* () {
            const checkTableExistsQuery = `
    SELECT EXISTS (
        SELECT 1
        FROM information_schema.tables
        WHERE table_name = '${this.tableName}'
    );
`;
            const checkTableExist = yield pg_store_1.PgStore.execQuery(checkTableExistsQuery);
            if (checkTableExist instanceof Error) {
                throw checkTableExist;
            }
            const tableExists = checkTableExist.rows[0].exists;
            if (tableExists) {
                return;
            }
            console.log(`Table ${this.tableName} not found. Creating...`);
            const query = `
          CREATE TABLE IF NOT EXISTS ${this.tableName} (
            yearly NUMERIC,
            monthly NUMERIC,
            createdAt TIMESTAMP WITH TIME ZONE  
            );
        `;
            const res = yield pg_store_1.PgStore.execQuery(query);
            if (res instanceof Error) {
                throw res;
            }
        });
    }
    read() {
        return __awaiter(this, void 0, void 0, function* () {
            const query = `
    SELECT yearly, monthly
    FROM ${this.tableName};
`;
            const result = yield pg_store_1.PgStore.execQuery(query);
            if (result instanceof Error) {
                throw result;
            }
            const movingAverage = {
                createdAt: new Date().toUTCString(),
                yearly: result.rows[0].yearly,
                monthly: result.rows[0].monthly,
            };
            return movingAverage;
        });
    }
    update(rowData) {
        return __awaiter(this, void 0, void 0, function* () {
            const query = `
    UPDATE ${this.tableName}
    SET yearly = $1,
        monthly = $2;
`;
            const result = yield pg_store_1.PgStore.execQuery(query, [
                rowData.yearly,
                rowData.monthly,
            ]);
            if (result instanceof Error) {
                throw result;
            }
            return true;
        });
    }
}
exports.MovingAverageStore = MovingAverageStore;
//# sourceMappingURL=pg.js.map