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
  readAll(): Promise<FeeIndex[] | Error>;
  readAllDetailed(): Promise<FeeIndexDetailed[] | Error>;
  updateIndex(): Promise<boolean | Error>;
  readLatest(): Promise<FeeIndexDetailed | Error>;
}
