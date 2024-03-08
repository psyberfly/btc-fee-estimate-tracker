import { FeeEstimate, FeeIndex } from "@prisma/client";

export interface FeeIndexDetailed {
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

export interface IIndexOp {
  //invoked every 10 min (block)
  readAll(since: Date): Promise<FeeIndex[] | Error>;
  readAllDetailed(): Promise<FeeIndexDetailed[] | Error>;
  create(feeEstimate: FeeEstimate): Promise<boolean | Error>;
  // seed(): Promise<boolean | Error>;
  readLatest(): Promise<FeeIndexDetailed | Error>;
}
