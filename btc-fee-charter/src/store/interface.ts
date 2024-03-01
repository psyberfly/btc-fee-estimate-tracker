import { ServiceChartType } from "../chart_data/interface";
import { TimeRange } from "../chart_data/chart_timescale";

export interface IStore {
  create(chartType: ServiceChartType, data: any): Promise<boolean | Error>;
  read(chartType: ServiceChartType, from: Date, to: Date): Promise<any | Error>;
  upsert(chartType: ServiceChartType, data:any): Promise<boolean | Error>;
}
