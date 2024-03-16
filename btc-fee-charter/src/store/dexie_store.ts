// import { FeeEstimate, FeeIndex, MovingAverage } from "./interface";
// import { TimeRange } from "../chart_data/chart_timescale";
// import { IStore } from "./interface";
// import { db } from "./dexie";
// import { ChartType } from "../chart_data/interface";

// //Store the most recent timestamp for each chartType history in a global exported object with {ServiceChartType, Date}.
// //Update it each time after upsert/create.

// export class DexieStore implements IStore {
//   historyStartTimestamp = async (
//     chartType: ChartType,
//   ): Promise<Date> => {
//     try {
//       console.log(chartType);
//       switch (chartType) {
//         case ChartType.feeIndex:
//           const date = await db.feeIndex.orderBy("time").first()["time"];
//           return date;

//         case ChartType.movingAverage:
//           return await db.movingAverages.orderBy("day").first()["day"];

//         case ChartType.feeEstimate:
//           return await db.feeEstimates.orderBy("time").first()["time"];

//         default:
//           throw new Error("Unknown ServiceChartType requested");
//       }
//     } catch (e) {
//       throw e;
//     }
//   };

//   historyEndTimestamp = async (
//     chartType: ChartType,
//   ): Promise<Date> => {
//     switch (chartType) {
//       case ChartType.feeIndex:
//         return await db.feeIndex.orderBy("time").reverse().first()["time"];

//       case ChartType.movingAverage:
//         return await db.movingAverages.orderBy("day").reverse().first()["day"];

//       case ChartType.feeEstimate:
//         return await db.feeEstimates.orderBy("time").reverse().first()["time"];

//       default:
//         throw new Error("Unknown ServiceChartType requested");
//     }
//   };

//   async create(
//     chartType: ChartType,
//     data: any,
//   ): Promise<boolean | Error> {
//     try {
//       switch (chartType) {
//         case ChartType.index:
//           await db.feeIndex.bulkAdd(data as FeeIndex[]);
//           break;
//         case ChartType.movingAverage:
//           await db.movingAverages.bulkAdd(data as MovingAverage[]);
//           break;
//         case ChartType.feeEstimate:
//           await db.feeEstimates.bulkAdd(data as FeeEstimate[]);
//           break;
//       }
//       return true;
//     } catch (e) {
//       return e;
//     }
//   }

//   async readLatest(chartType: ChartType): Promise<any | Error> {
//     let data;
//     switch (chartType) {
//       case ChartType.index:
//         data = await db.feeIndex.orderBy("time").reverse().first().then(
//           (latestEntry) => {
//             if (latestEntry) {
//               return latestEntry;
//             } else {
//               console.log("No entries found in the database for readLatest.");
//             }
//           },
//         ).catch((error) => {
//           console.error("Failed to find the most recent entry: ", error);
//         });
//         break;
//     }
//     return data;
//   }

//   async read(
//     chartType: ChartType,
//     // from: Date,
//     // to: Date,
//   ): Promise<any | Error> {
//     let data;
//     try {
//       switch (chartType) {
//         case ChartType.index:
//           data = await db.feeIndex.orderBy("time").toArray();

//           //  where("createdAt")
//           //   .between(from, to, true, true)
//           //   .toArray();
//           //
//           break;

//         case ChartType.movingAverage:
//           data = await db.movingAverages.orderBy("day")
//             // .where("createdAt")
//             // .between(from, to, true, true)
//             .toArray();

//           break;

//         case ChartType.feeEstimate:
//           data = await db.feeEstimates.orderBy("time")
//             // .where("time")
//             // .between(from, to, true, true)
//             .toArray();
//           break;
//       }

//       const length = data.length;
//       const dataSizeBytes = new Blob([JSON.stringify(data)]).size;
//       const dataSizeKB = dataSizeBytes / 1024;
//       const dataSizeMB = dataSizeKB / 1024;
//       console.log("Data Length:", length);
//       console.log("Size of data (KB):", dataSizeKB.toFixed(2), "KB");
//       console.log("Size of data (MB):", dataSizeMB.toFixed(2), "MB");
//       return data;
//     } catch (e) {
//       return e;
//     }
//   }

//   async upsert(
//     chartType: ChartType,
//     data: any,
//   ): Promise<boolean | Error> {
//     try {
//       switch (chartType) {
//         case ChartType.index:
//           await db.feeIndex.bulkPut(data as FeeIndex[]);
//           break;
//         case ChartType.movingAverage:
//           await db.movingAverages.bulkPut(data as MovingAverage[]);
//           break;
//         case ChartType.feeEstimate:
//           await db.feeEstimates.bulkPut(data as FeeEstimate[]);
//           break;
//       }
//       return true;
//     } catch (e) {
//       return e;
//     }
//   }
// }
