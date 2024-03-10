import { handleError } from "../../lib/errors/e";
import { IndexOp } from "../../ops/fee_index/fee_index";
import { IApiService } from "./interface";
import { FeeIndexDetailed } from "../../ops/fee_index/interface";
import { FeeEstimates, FeeIndexes, MovingAverages } from "@prisma/client";
import { FeeOp } from "../../ops/fee_estimate/fee_estimate";
import { MovingAverageOp } from "../../ops/moving_average/moving_average";

export class ApiService implements IApiService {

  
  private indexOp = new IndexOp();
  private feeOp = new FeeOp();
  private movingAverageOp = new MovingAverageOp();

  async getIndex(): Promise<Error | FeeIndexDetailed> {
    const index = await this.indexOp.readLatest();
    if (index instanceof Error) {
      return handleError(index);
    }
    return index;
  }


  async getIndexHistory(since:Date): Promise<Error | FeeIndexes[]> {
    try {
      const allFeeEst = await this.indexOp.readAll(since);
      if (allFeeEst instanceof Error) {
        return handleError(allFeeEst);
      }

      return allFeeEst;
    } catch (e) {
      return handleError(e);
    }
  }

  async getMovingAverageHistory(since:Date): Promise<Error | MovingAverages[]> {
    try {
      const allFeeEst = await this.movingAverageOp.readAll(since);
      if (allFeeEst instanceof Error) {
        return handleError(allFeeEst);
      }

      return allFeeEst;
    } catch (e) {
      return handleError(e);
    }
  }

  async getFeeEstimateHistory(since:Date): Promise<Error | FeeEstimates[]> {
    try {
      const allFeeEst = await this.feeOp.readAll(since);
      if (allFeeEst instanceof Error) {
        return handleError(allFeeEst);
      }

      return allFeeEst;
    } catch (e) {
      return handleError(e);
    }
  }

  //UNUSED:

  async getIndexDetailedHistory(): Promise<Error | FeeIndexDetailed[]> {
    try {
   const allIndex = await this.indexOp.readAllDetailed();
   if (allIndex instanceof Error) {
     return handleError(allIndex);
   }

   return allIndex;
 } catch (e) {
   return handleError(e);
 }
}

}
