// import { PgStore } from "../../../infra/db";
// import { handleError } from "../../../lib/errors/e";
// import { FeeEstMovingAverage } from "../interface";
// export class MovingAverageStore {
//   private tableName = "moving_average";
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
//                   last_365_days NUMERIC,
//                   last_30_days NUMERIC,
//                   created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP  
//                   );
//               `;
//     const res = await PgStore.execQuery(query);
//     if (res instanceof Error) {
//       throw res;
//     }
//   }
//   async readLatest(): Promise<FeeEstMovingAverage | Error> {
//     const query = `
//         SELECT *
//         FROM ${this.tableName};
//     `;
//     const result = await PgStore.execQuery(query);
//     if (result instanceof Error) {
//       return handleError(result);
//     }
//     const movingAverage: FeeEstMovingAverage = {
//       id: result.rows[0]["id"],
//       createdAt: result.rows[0]["created_at"],
//       last365Days: result.rows[0]["last_365_days"],
//       last30Days: result.rows[0]["last_30_days"],
//     };
//     return movingAverage;
//   }
//   async insert(movingAverage: FeeEstMovingAverage): Promise<boolean | Error> {
//     const query = `
//        INSERT INTO ${this.tableName} (last_365_days, last_30_days) 
//        VALUES (${movingAverage.last365Days}, ${movingAverage.last30Days});
//     `;
//     const result = await PgStore.execQuery(query);
//     if (result instanceof Error) {
//       return handleError(result);
//     }
//     return true;
//   }
//   async checkRowExistsByDate(dateUTC: string): Promise<boolean | Error> {
//     const query = `
//     SELECT COUNT(*) AS count
//     FROM ${this.tableName}
//     WHERE
//     DATE(created_at) = CURRENT_DATE::timestamp with time zone;
//         `;
//     const result = await PgStore.execQuery(query);
//     if (result instanceof Error) {
//       return handleError(result);
//     }
//     const exists = result.rows[0]["count"] > 0;
//     return exists;
//   }
// }
//# sourceMappingURL=pg.js.map