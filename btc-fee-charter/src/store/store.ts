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
  latestDataTimestamp = async (
    chartType: ServiceChartType,
  ): Promise<Date> => {
    let latestTimeStamp: Date;
    switch (chartType) {
      case ServiceChartType.index:
        latestTimeStamp = await db.feeIndex
          .orderBy("createdAt")
          .reverse() // Order by 'createdAt' descending (most recent first)
          .first()["createdAt"];

      case ServiceChartType.movingAverage:
        return await db.movingAverages
          .orderBy("createdAt")
          .reverse() // Order by 'createdAt' descending (most recent first)
          .first()["createdAt"];
      case ServiceChartType.feeEstimate:
        return await db.feeEstimates
          .orderBy("time")
          .reverse() // Order by 'createdAt' descending (most recent first)
          .first()["time"];
      default:
        throw (Error(
          " Store: latestDataTimestamp : Unknown ServiceChartType requested",
        ));
    }
  };

  async create(
    chartType: ServiceChartType,
    data: any,
  ): Promise<boolean | Error> {
    try {
      switch (chartType) {
        case ServiceChartType.index:
          const dbCreateRes = await db.feeIndex.bulkAdd(data as FeeIndex[]);
          console.log({ res: dbCreateRes });
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
    from: Date,
    to: Date,
  ): Promise<any | Error> {
    let data;
    try {
      switch (chartType) {
        case ServiceChartType.index:
          data = await db.feeIndex.where("createdAt")
            .between(from, to, true, true)
            .toArray();
          break;

        case ServiceChartType.movingAverage:
          data = await db.movingAverages.where("createdAt")
            .between(from, to, true, true)
            .toArray();
          break;

        case ServiceChartType.feeEstimate:
          data = await db.feeEstimates.where("time")
            .between(from, to, true, true)
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
          const dbCreateRes = await db.feeIndex.bulkPut(data as FeeIndex[]);
          console.log({ res: dbCreateRes });
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
