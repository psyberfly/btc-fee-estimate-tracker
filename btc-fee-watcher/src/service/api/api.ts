import { handleError } from "../../lib/errors/e";
import { IndexOp } from "../../ops/fee_index/fee_index";
import { IApiService } from "./interface";
import { FeeIndexDetailed } from "../../ops/fee_index/interface";
import { FeeEstimates, FeeIndexes, MovingAverages } from "@prisma/client";
import { FeeOp } from "../../ops/fee_estimate/fee_estimate";
import { MovingAverageOp } from "../../ops/moving_average/moving_average";
import { isFiveMonthsAgoOrMore } from "../../lib/date/date";

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

  // async getFeeEstimateHistory(since: Date): Promise<Error | FeeEstimates[]> {
  //   try {
  //     let res;
  //     if (isFiveMonthsAgoOrMore(since)) {
  //       const feeEstArchivedHistory = await this.feeOp.readAllArchived(since);
  //       if (feeEstArchivedHistory instanceof Error) {
  //         return handleError(feeEstArchivedHistory);
  //       }
  //       const feeEstsArchived = feeEstArchivedHistory.map((feeEst) => ({
  //         id: feeEst.id,
  //         time: feeEst.startTime,
  //         satsPerByte: feeEst.avgSatsPerByte,
  //       }));
  //       res = feeEstsArchived;
  //     } else {
  //       const feeEstHistory = await this.feeOp.readAll(since);
  //       if (feeEstHistory instanceof Error) {
  //         return handleError(feeEstHistory);
  //       }
  //       res = feeEstHistory;
  //     }

  //     return res;
  //   } catch (e) {
  //     return handleError(e);
  //   }
  // }

  async getFeeEstimateHistory(since: Date): Promise<Error | FeeEstimates[]> {
    try {
      let res;
      // Calculate the date 5 months ago from now
      const fiveMonthsAgo = new Date();
      fiveMonthsAgo.setMonth(fiveMonthsAgo.getMonth() - 5);

      // Always fetch the uncompressed history for the last 5 months
      const recentHistory = await this.feeOp.readAll(fiveMonthsAgo);
      if (recentHistory instanceof Error) {
        return handleError(recentHistory);
      }

      res = recentHistory;

      // If the 'since' date is more than 5 months ago, also fetch the compressed history
      if (since < fiveMonthsAgo) {
        const feeEstArchivedHistory = await this.feeOp.readAllArchived(since);
        if (feeEstArchivedHistory instanceof Error) {
          return handleError(feeEstArchivedHistory);
        }
        const feeEstsArchived = feeEstArchivedHistory.map((feeEst) => ({
          id: feeEst.id,
          time: feeEst.startTime,
          satsPerByte: feeEst.avgSatsPerByte,
        }));

        // Prepend the compressed history to the uncompressed recent history
        res = [...feeEstsArchived, ...res];
      }

      return res;
    } catch (e) {
      return handleError(e);
    }
  }

  // async getIndexHistory(since: Date): Promise<Error | FeeIndexes[]> {
  //   try {
  //     let res;
  //     if (isFiveMonthsAgoOrMore(since)) {
  //       const feeIndexArchivedHistory = await this.indexOp.readAllArchived(
  //         since,
  //       );
  //       if (feeIndexArchivedHistory instanceof Error) {
  //         return handleError(feeIndexArchivedHistory);
  //       }
  //       const feeIndexesArchived = feeIndexArchivedHistory.map((
  //         feeIndexArchive,
  //       ) => ({
  //         id: feeIndexArchive.id,
  //         time: feeIndexArchive.startTime,
  //         ratioLast30Days: feeIndexArchive.avgRatioLast30Days,
  //         ratioLast365Days: feeIndexArchive.avgRatioLast365Days,
  //         createdAt: feeIndexArchive.createdAt,
  //       }));
  //       res = feeIndexesArchived;
  //     } else {
  //       const feeIndexes = await this.indexOp.readAll(since);
  //       if (feeIndexes instanceof Error) {
  //         return handleError(feeIndexes);
  //       }
  //       res = feeIndexes;
  //     }
  //     return res;
  //   } catch (e) {
  //     return handleError(e);
  //   }
  // }

  async getIndexHistory(since: Date): Promise<Error | FeeIndexes[]> {
    try {
      let res;
      // Calculate the date 5 months ago from now
      const fiveMonthsAgo = new Date();
      fiveMonthsAgo.setMonth(fiveMonthsAgo.getMonth() - 5);

      // Always fetch the uncompressed history for the last 5 months
      const recentHistory = await this.indexOp.readAll(fiveMonthsAgo);
      if (recentHistory instanceof Error) {
        return handleError(recentHistory);
      }

      res = recentHistory;

      // If the 'since' date is more than 5 months ago, fetch the compressed history as well
      if (since < fiveMonthsAgo) {
        const feeIndexArchivedHistory = await this.indexOp.readAllArchived(
          since,
        );
        if (feeIndexArchivedHistory instanceof Error) {
          return handleError(feeIndexArchivedHistory);
        }
        const feeIndexesArchived = feeIndexArchivedHistory.map((
          feeIndexArchive,
        ) => ({
          id: feeIndexArchive.id,
          time: feeIndexArchive.startTime,
          ratioLast30Days: feeIndexArchive.avgRatioLast30Days,
          ratioLast365Days: feeIndexArchive.avgRatioLast365Days,
          createdAt: feeIndexArchive.createdAt,
        }));

        // Prepend the compressed history to the uncompressed history
        res = [...feeIndexesArchived, ...res];
      }

      return res;
    } catch (e) {
      return handleError(e);
    }
  }

  async getMovingAverageHistory(
    since: Date,
  ): Promise<Error | MovingAverages[]> {
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

  async getIndexDetailed(
  ): Promise<Error | FeeIndexDetailed> {
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
