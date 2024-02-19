// import { Client, Pool, PoolClient, QueryResult } from "pg";
// import * as fs from "fs";
// import * as dotenv from "dotenv";
// import { handleError } from "../lib/errors/e";
// import { FeeEstPgStore } from "../op/fee_estimate/store/pg";
// import { IndexStore } from "../op/index/store/pg";
// import { MovingAverageStore } from "../op/moving_average/store/pg";
// dotenv.config();

// const pool = new Pool({
//   host: process.env.DB_HOST,
//   port: parseInt(process.env.DB_PORT || "5432"),
//   user: process.env.DB_USER,
//   password: process.env.DB_PASSWORD,
//   database: process.env.DB_DATABASE,
// });

// export async function initDB() {
//   // Init table creation if not exist:
//   const feeHistoryStore = new FeeEstPgStore();
//   const movingAverageStore = new MovingAverageStore();
//   const indexStore = new IndexStore();

//   await feeHistoryStore.initTable();
//   await movingAverageStore.initTable();
//   await indexStore.initTable();
// }

// export class PgStore {
//   public static async execQuery(
//     query: string,
//     values?: any[],
//   ): Promise<QueryResult<any> | Error> {
//     const client = await pool.connect();
//     try {
//       await client.query("BEGIN");
//       const res = await client.query(query, values);
//       await client.query("COMMIT");
//       return res;
//     } catch (e) {
//       console.error(`PgStore: Error executing query! Query: ${query}`);
//       console.error(e);
//       await client.query("ROLLBACK");
//       return handleError(e);
//     } finally {
//       client.release();
//     }
//   }

//   public static async disconnectDb() {
//     await pool.end();
//   }

//   //Makeshift method:
//   public static async copyCsvDataToTable(
//     filePath: string, //filePath is relative to PG-DB's FS
//     tableName: string,
//   ): Promise<void> {
//     try {
//       // Read the CSV file
//       //const csvData = fs.readFileSync(filePath, "utf8");
//       console.log({ filePath });
//       // Copy data from the CSV file into the PostgreSQL table
//       const query = `
//       COPY ${tableName}
//       FROM '${filePath}'
//       DELIMITER ','
//       CSV HEADER;
//       `;
//       console.log(query);

//       const res = await PgStore.execQuery(
//         query,
//       );

//       if (res instanceof Error) {
//         throw res;
//       }
//       console.log(`CSV data copied into table ${tableName} successfully.`);
//     } catch (error) {
//       console.error("Error copying CSV data to table:", error);
//     }
//   }
// }
