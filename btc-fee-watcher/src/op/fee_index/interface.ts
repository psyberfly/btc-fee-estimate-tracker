import { FeeEstimate, FeeIndex } from "@prisma/client";

export interface IndexResponse {
  timestamp: Date;
  feeEstimateMovingAverageRatio: {
    last365Days: number;
    last30Days: number;
  };
  currentFeeEstimate: {
    satsPerByte: number;
  };
  movingAverage: {
    createdAt:Date;
    last365Days: number;
    last30Days: number;
  };
}

export interface IIndexOp {
  //invoked every 10 min (block)
  updateIndex(currentFee: FeeEstimate): Promise<boolean | Error>;
  readLatest(): Promise<IndexResponse | Error>;
}
