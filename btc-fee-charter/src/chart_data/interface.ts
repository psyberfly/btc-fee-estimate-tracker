export enum ServiceChartType {
  index = "Fee Estimate Index",
  movingAverage = "Moving Average",
  feeEstimate = "Fee Estimate History",
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
    kind: ServiceChartType,
  ): object | Error;

  //new
  // getFeeIndex(data: FeeIndex[]): object | Error;
  // getMovingAverage(data: MovingAverage[]): object | Error;
  // getFeeEstimate(data: FeeEstimate[]): object | Error;
}
