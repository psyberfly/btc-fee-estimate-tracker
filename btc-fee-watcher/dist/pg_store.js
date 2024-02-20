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
exports.PgStore = void 0;
const pg_1 = require("pg");
const dotenv = __importStar(require("dotenv"));
dotenv.config();
class PgStore {
    static execQuery(query, values) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const client = new pg_1.Client({
                    host: process.env.DB_HOST,
                    port: parseInt(process.env.DB_PORT || "5432"),
                    user: process.env.DB_USER,
                    password: process.env.DB_PASSWORD,
                    database: process.env.DB_DATABASE,
                });
                yield client.connect();
                const res = yield client.query(query, values);
                yield client.end();
                return res;
            }
            catch (e) {
                return e;
            }
        });
    }
    //Makeshift method:
    static copyCsvDataToTable(filePath, //filePath is relative to PG-DB's FS
    tableName) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                // Read the CSV file
                //const csvData = fs.readFileSync(filePath, "utf8");
                console.log({ filePath });
                // Copy data from the CSV file into the PostgreSQL table
                const query = `
      COPY ${tableName}
      FROM '${filePath}'
      DELIMITER ','
      CSV HEADER;
      `;
                console.log(query);
                const res = yield PgStore.execQuery(query);
                if (res instanceof Error) {
                    throw res;
                }
                console.log(`CSV data copied into table ${tableName} successfully.`);
            }
            catch (error) {
                console.error("Error copying CSV data to table:", error);
            }
        });
    }
}
exports.PgStore = PgStore;
//# sourceMappingURL=pg_store.js.map