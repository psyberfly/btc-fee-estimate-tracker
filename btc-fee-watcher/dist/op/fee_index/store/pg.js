// import { PgStore } from "../../../infra/db";
// import { handleError } from "../../../lib/errors/e";
// import { FeeEstimate } from "../../fee_estimate/interface";
// import { FeeEstMovingAverage } from "../../moving_average/interface";
// import { Index } from "../interface";
// export class IndexStore {
//   private tableName = "fee_index";
//   private tableNameFeeEst = "fee_estimate";
//   private tableNameMovingAverage = "moving_average";
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
//     const query = `
//                 CREATE TABLE IF NOT EXISTS ${this.tableName} (
//                   id SERIAL PRIMARY KEY,
//                   fee_estimate_id SERIAL REFERENCES fee_estimate(id),
//                   moving_average_id SERIAL REFERENCES moving_average(id),
//                   ratio_last_365_days NUMERIC,
//                   ratio_last_30_days NUMERIC,
//                   created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP  
//                   );
//               `;
//     const res = await PgStore.execQuery(query);
//     if (res instanceof Error) {
//       handleError(res);
//     }
//   }
//   async readLatest(): Promise<Index | Error> {
//     //3 SQL queries can be combined into one with JOINS and AS...
//     try {
//       const indexQuery = `
//       SELECT *
//       FROM ${this.tableName}
//       ORDER BY created_at DESC
//       LIMIT 1;  
//         `;
//       const indexRes = await PgStore.execQuery(indexQuery);
//       console.log({indexRes});
//       if (indexRes instanceof Error) {
//         return handleError(indexRes);
//       }
//       const feeEstimateId = indexRes.rows[0]["fee_estimate_id"];
//       const movingAverageId = indexRes.rows[0]["moving_average_id"];
//       const feeEstimateQuery = `
//         SELECT *
//         FROM ${this.tableNameFeeEst}
//         WHERE id= ${feeEstimateId} 
//         `;
//       const feeEstimateRes = await PgStore.execQuery(feeEstimateQuery);
//       if (feeEstimateRes instanceof Error) {
//         return handleError(feeEstimateRes);
//       }
//       const movingAverageQuery = `
//         SELECT *
//         FROM ${this.tableNameMovingAverage}
//         WHERE id= ${movingAverageId} 
//         `;
//       const movingAverageRes = await PgStore.execQuery(movingAverageQuery);
//       if (movingAverageRes instanceof Error) {
//         return handleError(movingAverageRes);
//       }
//       const feeEst: FeeEstimate = {
//         id: feeEstimateRes[0]["id"],
//         time: feeEstimateRes[0]["time"],
//         satsPerByte: feeEstimateRes[0]["sats_per_byte"],
//       };
//       const movingAverage: FeeEstMovingAverage = {
//         id: movingAverageRes[0]["id"],
//         createdAt: movingAverageRes[0]["created_at"],
//         last365Days: movingAverageRes[0]["last_365_days"],
//         last30Days: movingAverageRes[0]["last_30_days"],
//       };
//       const index: Index = {
//         feeEstimate: feeEst,
//         movingAverage: movingAverage,
//         ratioLast365Days: indexRes[0]["ratio_last_365_days"],
//         ratioLast30Days: indexRes[0]["ratio_last_30_days"],
//         createdAt: indexRes[0]["created_at"],
//       };
//       return index;
//     } catch (e) {
//       return handleError(e);
//     }
//   }
//   async insert(index: Index): Promise<boolean | Error> {
//     const query = `
//        INSERT INTO ${this.tableName} (fee_estimate_id, moving_average_id, ratio_last_365_days, ratio_last_30_days) 
//        VALUES (${index.feeEstimate.id}, ${index.movingAverage.id}, ${index.ratioLast365Days},${index.ratioLast30Days});
//     `;
//     const result = await PgStore.execQuery(query);
//     if (result instanceof Error) {
//       return handleError(result);
//     }
//     return true;
//   }
// }
//# sourceMappingURL=pg.js.map