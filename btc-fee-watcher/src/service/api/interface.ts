import { FeeIndexDetailed } from "../../ops/fee_index/interface";
import { FeeEstimates, FeeIndexes, MovingAverages } from "@prisma/client";

export interface IApiService {
  getIndex(): Promise<FeeIndexDetailed | Error>; //Used for API
  getFeeEstimateHistory(since: Date): Promise<FeeEstimateHistory | Error>; //Used for chart
  getIndexHistory(since: Date): Promise<FeeIndexHistory | Error>; //Used for chart
  getMovingAverageHistory(since: Date): Promise<MovingAverageHistory | Error>; //Used for chart

  //UNUSED:
  //getIndexDetailedHistory(since: Date): Promise<FeeIndexHistory | Error>; //Used for chart
}

export type FeeEstimateHistory = Omit<FeeEstimates, "id" | "createdAt">[];
export type MovingAverageHistory = Omit<MovingAverages, "id" | "createdAt">[];
export type FeeIndexHistory = Omit<
  FeeIndexes,
  "id" | "feeEstimateId" | "movingAverageId" | "createdAt"
>[];
