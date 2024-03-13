import { FeeEstimates, FeeIndexes, MovingAverages } from "@prisma/client";

export interface FeeIndexDetailed {
  time: Date;
  feeEstimateMovingAverageRatio: {
    last365Days: number;
    last30Days: number;
  };
  currentFeeEstimate: {
    time: Date;
    satsPerByte: number;
  };
  movingAverage: {
    day: Date;
    last365Days: number;
    last30Days: number;
  };
}

export interface IIndexOp {
  readAll(since: Date): Promise<FeeIndexes[] | Error>;
  readAllDetailed(since: Date): Promise<FeeIndexDetailed[] | Error>;
  create(
    feeEstimate: FeeEstimates,
    movingAverage: MovingAverages,
  ): Promise<boolean | Error>;
  seed(since: Date): Promise<boolean | Error>;
  readLatest(): Promise<FeeIndexDetailed | Error>;
}
