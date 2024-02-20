"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
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
exports.FeeHistoryStore = void 0;
const pg_store_1 = require("../pg_store");
const dotenv = __importStar(require("dotenv"));
dotenv.config();
class FeeHistoryStore {
    constructor() {
        this.tableName = "fee_history";
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
            const createQuery = `
        CREATE TABLE IF NOT EXISTS ${this.tableName} (
          time TIMESTAMP WITH TIME ZONE,
          sats_per_byte NUMERIC
        );
      `;
            const res = yield pg_store_1.PgStore.execQuery(createQuery);
            if (res instanceof Error) {
                throw res;
            }
            //load data:
            const csvFilePath = process.env.FEE_HISTORY_FILE_PATH;
            yield pg_store_1.PgStore.copyCsvDataToTable(csvFilePath, this.tableName).catch((error) => console.error("Error:", error));
        });
    }
    create(rowData) {
        return __awaiter(this, void 0, void 0, function* () {
            const query = `INSERT INTO ${this.tableName} (time, statsPerByte) VALUES ($1, $2)`;
            const result = yield pg_store_1.PgStore.execQuery(query, [
                rowData.time,
                rowData.satsPerByte,
            ]);
            if (result instanceof Error) {
                throw result;
            }
            return true;
        });
    }
    readByRange(fromDate, toDate) {
        return __awaiter(this, void 0, void 0, function* () {
            const query = `SELECT * FROM ${this.tableName} WHERE time >= $1 AND time <= $2`;
            const result = yield pg_store_1.PgStore.execQuery(query, [fromDate, toDate]);
            if (result instanceof Error) {
                throw result;
            }
            const feeHistory = result.rows.map((row) => ({
                time: row.time,
                satsPerByte: row.sats_per_byte,
            }));
            return feeHistory;
        });
    }
    readLatest() {
        return __awaiter(this, void 0, void 0, function* () {
            const query = `
    SELECT *
    FROM fee_history
    ORDER BY time DESC
    LIMIT 1;
`;
            const result = yield pg_store_1.PgStore.execQuery(query);
            if (result instanceof Error) {
                throw result;
            }
            const feeHistory = result.rows[0];
            return feeHistory;
        });
    }
}
exports.FeeHistoryStore = FeeHistoryStore;
//# sourceMappingURL=pg.js.map