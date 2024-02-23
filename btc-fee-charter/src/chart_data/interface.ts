export enum ServiceChartType {
  index = "Fee Estimate Index",
  movingAverage = "Moving Average",
  feeEstimate = "Fee Estimate History"
}

export interface IndexResponse {
  timestamp: Date;
  feeEstimateMovingAverageRatio: {
    last365Days: number;
    last30Days: number;
  };
  currentFeeEstimate: {
    time:Date;
    satsPerByte: number;
  };
  movingAverage: {
    createdAt: Date;
    last365Days: number;
    last30Days: number;
  };
}

export interface IDataOp {
  //currently 1 year's data would be 13.4mb.
  fetchAllTime(): Promise<IndexResponse[] | Error>;
  // getByTimeRange(
  //   fromDate: Date,
  //   toDate: Date,
  // ): Promise<object | Error>;
}

export interface IChartDatasetOp {
  getFromData(data: IndexResponse[], kind:ServiceChartType): object | Error;
}