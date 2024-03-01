import { FeeIndexDetailed } from "../../ops/fee_index/interface";
import { FeeEstimate, FeeIndex, MovingAverage } from "@prisma/client";

export interface IApiService {
  getIndex(): Promise<FeeIndexDetailed | Error>; //Used for API
  getFeeEstimateHistory(since: Date): Promise<FeeEstimate[] | Error>; //Used for chart
  getIndexHistory(since: Date): Promise<FeeIndex[] | Error>; //Used for chart
  getMovingAverageHistory(since: Date): Promise<MovingAverage[] | Error>; //Used for chart

  //UNUSED:
  getIndexDetailedHistory(): Promise<FeeIndexDetailed[] | Error>; //Used for chart

}
