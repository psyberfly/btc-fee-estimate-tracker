import { handleError } from "../../lib/errors/e";
import { IndexOp } from "../../ops/fee_index/fee_index";
import { IApiService } from "./interface";
import { IndexResponse } from "../../ops/fee_index/interface";
import { FeeEstimate } from "@prisma/client";
import { FeeOp } from "../../ops/fee_estimate/fee_estimate";

export class ApiService implements IApiService {

  
  private indexOp = new IndexOp();
  private feeOp = new FeeOp();

  async getIndex(): Promise<Error | IndexResponse> {
    const index = await this.indexOp.readLatest();
    if (index instanceof Error) {
      return handleError(index);
    }
    return index;
  }

  async getIndexHistory(): Promise<Error | IndexResponse[]> {
       try {
      const allIndex = await this.indexOp.readAll();
      if (allIndex instanceof Error) {
        return handleError(allIndex);
      }

      return allIndex;
    } catch (e) {
      return handleError(e);
    }
  }

  async getFeeEstimateHistory(): Promise<Error | FeeEstimate[]> {
    try {
      const allFeeEst = await this.feeOp.readAll();
      if (allFeeEst instanceof Error) {
        return handleError(allFeeEst);
      }

      return allFeeEst;
    } catch (e) {
      return handleError(e);
    }
  }
}
