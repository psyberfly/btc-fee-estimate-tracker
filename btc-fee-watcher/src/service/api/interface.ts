import { IndexResponse } from "../../ops/fee_index/interface";
import { FeeEstimate } from "@prisma/client";

export interface IApiService {
  getIndex(): Promise<IndexResponse | Error>; //Used for API
  getIndexHistory(): Promise<IndexResponse[] | Error>; //Used for chart
  getFeeEstimateHistory(): Promise<FeeEstimate[] | Error>; //Used for chart
}
