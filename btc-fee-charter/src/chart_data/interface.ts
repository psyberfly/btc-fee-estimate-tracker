import { FeeEstimate, FeeIndex, MovingAverage } from "../store/interface";

export enum ChartType {
  feeIndex = "feeIndex",
  movingAverage = "movingAverage",
  feeEstimate = "feeEstimate",
}

export interface IndexDetailed {
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

export interface IDataOp {
  fetchFeeIndexHistory(since: Date): Promise<FeeIndex[] | Error>;
  fetchMovingAverageHistory(since: Date): Promise<MovingAverage[] | Error>;
  fetchFeeEstimateHistory(since: Date): Promise<FeeEstimate[] | Error>;
  
  fetchIndexDetailed(): Promise<IndexDetailed| Error>; //unused
}

export interface IChartDatasetOp {
  getFromData<T extends FeeIndex[] | MovingAverage[] | FeeEstimate[]>(
    data: T,
    kind: ChartType,
  ): object | Error;

}

