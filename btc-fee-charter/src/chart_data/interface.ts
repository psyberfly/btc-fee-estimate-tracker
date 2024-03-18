import { FeeEstimate, FeeIndex, MovingAverage } from "../store/interface";

export enum ChartType {
  feeIndex = "feeIndex",
  movingAverage = "movingAverage",
  feeEstimate = "feeEstimate",
}

export interface IndexResponse {
  timestamp: Date;
  feeEstimateMovingAverageRatio: {
    last365Days: number;
    last30Days: number;
  };
  currentFeeEstimate: {
    time: Date;
    satsPerByte: number;
  };
  movingAverage: {
    createdAt: Date;
    last365Days: number;
    last30Days: number;
  };
}

export interface IndexDataResponse {
  data: IndexResponse[];
  lastUpdated: Date;
}

export interface IDataOp {
  fetchFeeIndexHistory(since: Date): Promise<FeeIndex[] | Error>;
  fetchMovingAverageHistory(since: Date): Promise<MovingAverage[] | Error>;
  fetchFeeEstimateHistory(since: Date): Promise<FeeEstimate[] | Error>;
  //unused:
  fetchIndexDetailedHistory(): Promise<IndexDataResponse | Error>; //unused
}

export interface IChartDatasetOp {
  //getFromData<T>(data: T[], kind: ServiceChartType): object | Error;

  getFromData<T extends FeeIndex[] | MovingAverage[] | FeeEstimate[]>(
    data: T,
    kind: ChartType,
  ): object | Error;

  //new
  // getFeeIndex(data: FeeIndex[]): object | Error;
  // getMovingAverage(data: MovingAverage[]): object | Error;
  // getFeeEstimate(data: FeeEstimate[]): object | Error;
}
