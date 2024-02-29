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

  upsert(chartType: ServiceChartType): Promise<boolean | Error> {
    throw new Error("Method not implemented.");
  }
}
