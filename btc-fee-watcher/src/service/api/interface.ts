import { IndexResponse } from "../../ops/fee_index/interface";

export interface IApiService {
  getIndex(): Promise<IndexResponse | Error>; //Used for API
  getIndexHistory(): Promise<IndexResponse[] | Error>; //Used for chart
}
