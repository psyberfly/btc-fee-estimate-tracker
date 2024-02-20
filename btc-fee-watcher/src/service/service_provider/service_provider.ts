import { handleError } from "../../lib/errors/e";
import { IndexOp } from "../../op/fee_index/fee_index";
import { IServiceProvider } from "./interface";
import { IndexResponse } from "../../op/fee_index/interface";

export class ServiceProvider implements IServiceProvider {
  private indexOp = new IndexOp();

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
}
