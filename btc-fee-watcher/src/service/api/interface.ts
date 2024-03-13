import { FeeIndexDetailed } from "../../ops/fee_index/interface";
import { FeeEstimates, FeeIndexes, MovingAverages } from "@prisma/client";

export interface IApiService {
  getIndex(): Promise<FeeIndexDetailed | Error>; //Used for API
  getFeeEstimateHistory(since: Date): Promise<FeeEstimates[] | Error>; //Used for chart
  getIndexHistory(since: Date): Promise<FeeIndexes[] | Error>; //Used for chart
  getMovingAverageHistory(since: Date): Promise<MovingAverages[] | Error>; //Used for chart

  //UNUSED:
  getIndexDetailedHistory(since: Date): Promise<FeeIndexDetailed[] | Error>; //Used for chart
}
