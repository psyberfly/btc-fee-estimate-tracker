import { ChartType } from "../chart_data/interface";

export interface FeeIndex {
  time: Date;
  ratioLast365Days: number;
  ratioLast30Days: number;
}

export interface MovingAverage {
  time: Date;
  last365Days: number;
  last30Days: number;
}

export interface FeeEstimate {
  time: Date;
  satsPerByte: number;
}

export interface IStore {
  //create(chartType: ChartType, data: any): Promise<boolean | Error>;
  getHistoryStartTime(chartType: ChartType): Promise<Date | Error>;
  getHistoryEndTime(chartType: ChartType): Promise<Date | Error>;
  readMany(chartType: ChartType// from: Date, to: Date
  ): Promise<any | Error>;
  readLatest(chartType: ChartType): Promise<any | Error>;
  upsert(chartType: ChartType, data: any): Promise<boolean | Error>;
}
