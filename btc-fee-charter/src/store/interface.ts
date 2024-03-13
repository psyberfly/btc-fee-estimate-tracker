import { ServiceChartType } from "../chart_data/interface";

export interface FeeIndex {
  time: Date;
  ratioLast365Days: number;
  ratioLast30Days: number;
}

export interface MovingAverage {
  day: Date;
  last365Days: number;
  last30Days: number;
}

export interface FeeEstimate {
  time: Date;
  satsPerByte: number;
}


export interface IStore {
  create(chartType: ServiceChartType, data: any): Promise<boolean | Error>;
  read(chartType: ServiceChartType, from: Date, to: Date): Promise<any | Error>;
  upsert(chartType: ServiceChartType, data:any): Promise<boolean | Error>;
}
