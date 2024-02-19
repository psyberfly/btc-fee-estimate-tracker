// import { Client, QueryArrayConfig, QueryResult } from "pg";
// import { PgStore } from "../../../infra/db";
// import { FeeEstimate } from "../interface";
// import * as dotenv from "dotenv";
// import { handleError } from "../../../lib/errors/e";
// dotenv.config();

// export class FeeEstPgStore {
//   private tableName = "fee_estimate";

//   async initTable(): Promise<void> {
//     const checkTableExistsQuery = `
//     SELECT EXISTS (
//         SELECT 1
//         FROM information_schema.tables
//         WHERE table_name = '${this.tableName}'
//     );
// `;

//     const checkTableExist = await PgStore.execQuery(checkTableExistsQuery);

//     if (checkTableExist instanceof Error) {
//       throw checkTableExist;
//     }

//     const tableExists = checkTableExist.rows[0].exists;

//     if (tableExists) {
//       return;
//     }

//     console.log(`Table ${this.tableName} not found. Creating...`);

//     const createQuery = `
//         CREATE TABLE IF NOT EXISTS ${this.tableName} (
//           id SERIAL PRIMARY KEY,
//           time TIMESTAMP WITH TIME ZONE,
//           sats_per_byte NUMERIC
//         );
//       `;

//     const res = await PgStore.execQuery(createQuery);

//     if (res instanceof Error) {
//       handleError(res);
//     }

//     //load data:

//     //   const csvFilePath = process.env.FEE_HISTORY_FILE_PATH;
//     //   await PgStore.copyCsvDataToTable(csvFilePath, this.tableName).catch((
//     //     error,
//     //   ) => console.error("Error:", error));
//   }

//   async insert(rowData: FeeEstimate): Promise<boolean | Error> {
//     const query =
//       `INSERT INTO ${this.tableName} (time, sats_per_byte) VALUES ($1, $2)`;
//     const result = await PgStore.execQuery(query, [
//       rowData.time,
//       rowData.satsPerByte,
//     ]);
//     if (result instanceof Error) {
//       return handleError(result);
//     }
//     return true;
//   }

//   async readByRange(
//     fromDate: String,
//     toDate: String,
//   ): Promise<FeeEstimate[] | Error> {
//     const query =
//       `SELECT * FROM ${this.tableName} WHERE time >= $1 AND time <= $2`;
//     const result = await PgStore.execQuery(query, [fromDate, toDate]);
//     if (result instanceof Error) {
//       return handleError(result);
//     }
//     const feeEstHistory: FeeEstimate[] = result.rows.map((row: any) => ({
//       id: row["id"],
//       time: row["time"],
//       satsPerByte: parseFloat(row["sats_per_byte"]),
//     }));
//     return feeEstHistory;
//   }

//   async readLatest(): Promise<FeeEstimate | Error> {
//     const query = `
//     SELECT *
//     FROM ${this.tableName}
//     ORDER BY time DESC
//     LIMIT 1;
// `;
//     const result = await PgStore.execQuery(query);
//     if (result instanceof Error) {
//       return handleError(result);
//     }
//     const feeEstimate: FeeEstimate = {
//       id: result.rows[0]["id"],
//       time: result.rows[0]["time"],
//       satsPerByte: result.rows[0]["sats_per_byte"],
//     };

//     return feeEstimate;
//   }
// }
