import { FeeIndexDetailed } from "../../ops/fee_index/interface";
import { FeeEstimate } from "@prisma/client";

export interface IApiService {
  getIndex(): Promise<FeeIndexDetailed | Error>; //Used for API
  getIndexDetailedHistory(): Promise<FeeIndexDetailed[] | Error>; //Used for chart
  getFeeEstimateHistory(): Promise<FeeEstimate[] | Error>; //Used for chart
}
