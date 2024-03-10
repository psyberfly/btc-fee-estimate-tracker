import {
  FeeEstimate,
  FeeIndex,
  MovingAverage,
  ServiceChartType,
} from "../chart_data/interface";
import { TimeRange } from "../chart_data/chart_timescale";
import { IStore } from "./interface";
import { db } from "./dexie";


//Store the most recent timestamp for each chartType history in a global exported object with {ServiceChartType, Date}.
//Update it each time after upsert/create.

export class Store implements IStore {
  historyStartTimestamp = async (
    chartType: ServiceChartType,
  ): Promise<Date> => {
    let record;
    switch (chartType) {
      case ServiceChartType.index:
        record = await db.feeIndex.orderBy("time").first();
        break;

      case ServiceChartType.movingAverage:
        record = await db.movingAverages.orderBy("day").first();
        break;

      case ServiceChartType.feeEstimate:
        record = await db.feeEstimates.orderBy("time").first();
        break;

      default:
        throw new Error("Unknown ServiceChartType requested");
    }

    if (!record) {
      return new Date();
    }
    return record.createdAt || record.time;
  };

  historyEndTimestamp = async (
    chartType: ServiceChartType,
  ): Promise<Date> => {
    let record;
    switch (chartType) {
      case ServiceChartType.index:
        record = await db.feeIndex.orderBy("time").reverse().first();
        break;

      case ServiceChartType.movingAverage:
        record = await db.movingAverages.orderBy("day").reverse().first();
        break;

      case ServiceChartType.feeEstimate:
        record = await db.feeEstimates.orderBy("time").reverse().first();
        break;

      default:
        throw new Error("Unknown ServiceChartType requested");
    }

    if (!record) throw new Error("No records found");
    return record.createdAt || record.time;
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

  async read(
    chartType: ServiceChartType,
    // from: Date,
    // to: Date,
  ): Promise<any | Error> {
    let data;
    try {
      switch (chartType) {
        case ServiceChartType.index:
          data = await db.feeIndex.toArray();
          //  where("createdAt")
          //   .between(from, to, true, true)
          //   .toArray();
          //
          break;

        case ServiceChartType.movingAverage:
          data = await db.movingAverages
            // .where("createdAt")
            // .between(from, to, true, true)
            .toArray();
          break;

        case ServiceChartType.feeEstimate:
          data = await db.feeEstimates
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
