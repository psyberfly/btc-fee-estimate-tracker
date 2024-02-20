import { IndexResponse } from "../../op/fee_index/interface";

export interface IServiceProvider {
  getIndex(): Promise<IndexResponse | Error>; //Used for API
  getIndexHistory(): Promise<IndexResponse[] | Error>; //Used for chart
}
