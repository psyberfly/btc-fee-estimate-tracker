import { handleError } from "../../lib/errors/e";
import { IndexOp } from "../../ops/fee_index/fee_index";
import {
  FeeEstimateHistory,
  FeeIndexHistory,
  IApiService,
  MovingAverageHistory,
} from "./interface";
import { FeeIndexDetailed } from "../../ops/fee_index/interface";
import { FeeEstimates, FeeIndexes, MovingAverages } from "@prisma/client";
import { FeeOp } from "../../ops/fee_estimate/fee_estimate";
import { MovingAverageOp } from "../../ops/moving_average/moving_average";
import { isFiveMonthsAgoOrMore } from "../../lib/date/date";
import {
  filterHistoryByInterval,
  getHistoryOutputIntervalFromReq,
  getUnarchivedIntervals,
  HistoryOutputInterval,
} from "./utils";
import { archivalStepSize } from "../../infra/index_watcher";

export class ApiService implements IApiService {
  private indexOp = new IndexOp();
  private feeOp = new FeeOp();
  private movingAverageOp = new MovingAverageOp();

  async getIndex(): Promise<Error | FeeIndexDetailed> {
    const index = await this.indexOp.readLatestDetailed();
    if (index instanceof Error) {
      return handleError(index);
    }
    return index;
  }
  async getFeeEstimateHistory(since: Date): Promise<Error | FeeEstimateHistory> {
    try {
      let history: FeeEstimateHistory = [];
  
      const historyOutputInterval = getHistoryOutputIntervalFromReq(since);

      if (
        getUnarchivedIntervals(archivalStepSize).includes(historyOutputInterval)
      ) {
        const res = await this.feeOp.readAll(since, true);

        if (res instanceof Error) {
          return handleError(res);
        }

        history = res;
      } else {
        const res = await this.feeOp.readAllArchived(
          since,
          true,
        );

        if (res instanceof Error) {
          return handleError(res);
        }
        history = res.map((e) => ({
          time: e.startTime,
          satsPerByte: e.avgSatsPerByte,
        }));
      }

      const filteredHistory = filterHistoryByInterval(
        history,
        historyOutputInterval,
      );

      return filteredHistory;
    } catch (e) {
      return handleError(e);
    }
  }



  async getIndexHistory(since: Date): Promise<Error | FeeIndexHistory> {
    try {
      let history: FeeIndexHistory = [];
  
      const historyOutputInterval = getHistoryOutputIntervalFromReq(since);

      if (
        getUnarchivedIntervals(archivalStepSize).includes(historyOutputInterval)
      ) {
        const res = await this.indexOp.readAll(since, true);

        if (res instanceof Error) {
          return handleError(res);
        }

        history = res;
      } else {
        const res = await this.indexOp.readAllArchived(
          since,
          true,
        );

        if (res instanceof Error) {
          return handleError(res);
        }
        history = res.map((e) => ({
          time: e.startTime,
          ratioLast30Days: e.avgRatioLast30Days,
          ratioLast365Days: e.avgRatioLast365Days,
        }));
      }

      const filteredHistory = filterHistoryByInterval(
        history,
        historyOutputInterval,
      );

      return filteredHistory;
    } catch (e) {
      return handleError(e);
    }
  }

  async getMovingAverageHistory(
    since: Date,
  ): Promise<Error | MovingAverageHistory> {
    try {
      const allFeeEst = await this.movingAverageOp.readAll(since, true);
      if (allFeeEst instanceof Error) {
        return handleError(allFeeEst);
      }

      return allFeeEst;
    } catch (e) {
      return handleError(e);
    }
  }

  async getIndexDetailedHistory(
    since: Date,
  ): Promise<Error | FeeIndexDetailed[]> {
    try {
      const allIndex = await this.indexOp.readAllDetailed(since);
      if (allIndex instanceof Error) {
        return handleError(allIndex);
      }

      return allIndex;
    } catch (e) {
      return handleError(e);
    }
  }

  async getIndexDetailed(): Promise<Error | FeeIndexDetailed> {
    try {
      const res = await this.indexOp.readLatestDetailed();
      if (res instanceof Error) {
        return handleError(res);
      }

      return res;
    } catch (e) {
      return handleError(e);
    }
  }
}
