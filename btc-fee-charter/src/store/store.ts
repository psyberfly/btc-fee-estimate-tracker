import { FeeEstimate, FeeIndex, MovingAverage } from "../store/interface";
import { TimeRange } from "../chart_data/chart_timescale";
import { IStore } from "./interface";
import { db } from "./dexie";
import { ServiceChartType } from "../chart_data/interface";

//Store the most recent timestamp for each chartType history in a global exported object with {ServiceChartType, Date}.
//Update it each time after upsert/create.

export class Store implements IStore {
  historyStartTimestamp = async (
    chartType: ServiceChartType,
  ): Promise<Date> => {
    try {
      switch (chartType) {
        case ServiceChartType.index:
          const date = await db.feeIndex.orderBy("time").first()["time"];
          return date;

        case ServiceChartType.movingAverage:
          return await db.movingAverages.orderBy("day").first()["day"];

        case ServiceChartType.feeEstimate:
          return await db.feeEstimates.orderBy("time").first()["time"];

        default:
          throw new Error("Unknown ServiceChartType requested");
      }
    } catch (e) {
      throw e;
    }
  };

  historyEndTimestamp = async (
    chartType: ServiceChartType,
  ): Promise<Date> => {
    switch (chartType) {
      case ServiceChartType.index:
        return await db.feeIndex.orderBy("time").reverse().first()["time"];

      case ServiceChartType.movingAverage:
        return await db.movingAverages.orderBy("day").reverse().first()["day"];

      case ServiceChartType.feeEstimate:
        return await db.feeEstimates.orderBy("time").reverse().first()["time"];

      default:
        throw new Error("Unknown ServiceChartType requested");
    }
  };

  async create(
    chartType: ServiceChartType,
    data: any,
  ): Promise<boolean | Error> {
    try {
      switch (chartType) {
        case ServiceChartType.index:
          await db.feeIndex.bulkAdd(data as FeeIndex[]);
          break;
        case ServiceChartType.movingAverage:
          await db.movingAverages.bulkAdd(data as MovingAverage[]);
          break;
        case ServiceChartType.feeEstimate:
          await db.feeEstimates.bulkAdd(data as FeeEstimate[]);
          break;
      }
      return true;
    } catch (e) {
      return e;
    }
  }

  async readLatest(chartType: ServiceChartType): Promise<any | Error> {
    let data;
    switch (chartType) {
      case ServiceChartType.index:
        data = await db.feeIndex.orderBy("time").reverse().first().then(
          (latestEntry) => {
            if (latestEntry) {
              return latestEntry;
            } else {
              console.log("No entries found in the database for readLatest.");
            }
          },
        ).catch((error) => {
          console.error("Failed to find the most recent entry: ", error);
        });
        break;
    }
    return data;
  }

  async read(
    chartType: ServiceChartType,
    // from: Date,
    // to: Date,
  ): Promise<any | Error> {
    let data;
    try {
      switch (chartType) {
        case ServiceChartType.index:
          data = await db.feeIndex.orderBy("time").toArray();

          //  where("createdAt")
          //   .between(from, to, true, true)
          //   .toArray();
          //
          break;

        case ServiceChartType.movingAverage:
          data = await db.movingAverages.orderBy("day")
            // .where("createdAt")
            // .between(from, to, true, true)
            .toArray();

          break;

        case ServiceChartType.feeEstimate:
          data = await db.feeEstimates.orderBy("time")
            // .where("time")
            // .between(from, to, true, true)
            .toArray();
          break;
      }

      return data;
    } catch (e) {
      return e;
    }
  }

  async upsert(
    chartType: ServiceChartType,
    data: any,
  ): Promise<boolean | Error> {
    try {
      switch (chartType) {
        case ServiceChartType.index:
          await db.feeIndex.bulkPut(data as FeeIndex[]);
          break;
        case ServiceChartType.movingAverage:
          await db.movingAverages.bulkPut(data as MovingAverage[]);
          break;
        case ServiceChartType.feeEstimate:
          await db.feeEstimates.bulkPut(data as FeeEstimate[]);
          break;
      }
      return true;
    } catch (e) {
      return e;
    }
  }
}
