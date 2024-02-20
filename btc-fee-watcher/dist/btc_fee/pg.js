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
exports.BtcFeeModel = void 0;
const pg_1 = require("pg");
class BtcFeeModel {
    constructor() {
        // Use the provided database connection object
        this.client = new pg_1.Client({
            host: process.env.DB_HOST,
            port: parseInt(process.env.DB_PORT || "5432"),
            user: process.env.DB_USER,
            password: process.env.DB_PASSWORD,
            database: process.env.DB_DATABASE,
            // ssl: {
            //   rejectUnauthorized: false, // For development purposes only, remove in production
            // },
        });
    }
    execQuery(query, values) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                yield this.client.connect();
                const res = yield this.client.query(query, values);
                yield this.client.end();
                return res;
            }
            catch (e) {
                return e;
            }
        });
    }
    createTable() {
        return __awaiter(this, void 0, void 0, function* () {
            const query = `
        CREATE TABLE IF NOT EXISTS btc_fee (
          time TIMESTAMP,
          satsPerByte NUMERIC
        );
      `;
            const res = yield this.execQuery(query);
            if (res instanceof Error) {
                throw res;
            }
        });
    }
    create(rowData) {
        return __awaiter(this, void 0, void 0, function* () {
            const query = "INSERT INTO btc_fee (time, statsPerByte) VALUES ($1, $2)";
            const result = yield this.execQuery(query, [
                rowData.time,
                rowData.satsPerByte,
            ]);
            if (result instanceof Error) {
                return result;
            }
            return true;
        });
    }
    read() {
        return __awaiter(this, void 0, void 0, function* () {
            const query = "SELECT * FROM my_table";
            const result = yield this.execQuery(query);
            if (result instanceof Error) {
                return result;
            }
            return result.rows;
        });
    }
}
exports.BtcFeeModel = BtcFeeModel;
//# sourceMappingURL=pg.js.map