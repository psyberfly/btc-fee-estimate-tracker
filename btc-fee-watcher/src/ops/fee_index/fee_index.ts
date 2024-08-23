import { FeeEstimates, FeeIndexes, FeeIndexesArchive } from "@prisma/client";
import { handleError } from "../../lib/errors/e";
import { FeeOp } from "../fee_estimate/fee_estimate";
import {
  FeeIndexDetailed,
  FeeIndexesArchiveBulkInsert,
  IIndexOp,
} from "./interface";
import { FeeIndexPrismaStore } from "./store/prisma";
import { MovingAveragePrismaStore } from "../moving_average/store/prisma";
import { FeeEstimatePrismaStore } from "../fee_estimate/store/prisma";
import { Decimal } from "@prisma/client/runtime/library";
import { calculateFeeIndexWeightedAverage } from "../../lib/math/average";

export class IndexOp implements IIndexOp {
  private feeOp = new FeeOp();
  private store = new FeeIndexPrismaStore();
  private movingAvgStore = new MovingAveragePrismaStore();

  async readLatestDetailed(): Promise<FeeIndexDetailed | Error> {
    const res = await this.store.fetchLatestDetailed();
    if (res instanceof Error) {
      return handleError(res);
    }

    return res;
  }

  async readAllDetailed(from: Date): Promise<FeeIndexDetailed[] | Error> {
    const res = await this.store.fetchDetailed90Days(from);
    if (res instanceof Error) {
      return handleError(res);
    }

    return res;
  }

  async readAll(since: Date, isHistoric?:boolean): Promise<FeeIndexes[] | Error> {
    const res = await this.store.fetchAll(since, isHistoric);
    if (res instanceof Error) {
      return handleError(res);
    }

    return res;
  }

  async readAllArchived(since: Date, isHistoric?:boolean): Promise<FeeIndexesArchive[] | Error> {
    const res = await this.store.fetchAllArchived(since, isHistoric);
    if (res instanceof Error) {
      return handleError(res);
    }

    return res;
  }

  async seed(since: Date): Promise<boolean | Error> {
    try {
      //read all fee estimates from since to today
      const feeEstimates = await this.feeOp.readAll(since);

      if (feeEstimates instanceof Error) {
        console.error("Error reading fee estimates from DB!");
        throw feeEstimates;
      }

      for (const feeEstimate of feeEstimates) {
        const res = await this.create(feeEstimate);
        if (res instanceof Error) {
          console.error(`Error creating feeIndex: ${res}`);
        }
      }
      return true;
    } catch (e) {
      return handleError(e);
    }
  }

  async create(feeEstimate: FeeEstimates): Promise<boolean | Error> {
    try {
      const movingAverage = await this.movingAvgStore.readByDay(
        feeEstimate.time,
      );

      if (!movingAverage) {
        console.error(`No moving averge for fee est: ${feeEstimate.time}`);
        return true;
      }

      if (
        !(movingAverage instanceof Error) &&
        movingAverage
      ) {
        const ratioLast365Days = feeEstimate.satsPerByte.toNumber() /
          movingAverage.last365Days.toNumber();

        const ratioLast30Days = feeEstimate.satsPerByte.toNumber() /
          movingAverage.last30Days.toNumber();

        const index: FeeIndexes = {
          id: null, //added by DB
          time: feeEstimate.time,
          feeEstimateId: feeEstimate.id,
          movingAverageId: movingAverage.id,
          ratioLast365Days: new Decimal(ratioLast365Days),
          ratioLast30Days: new Decimal(ratioLast30Days),
          createdAt: null, //added by DB
        };

        const res = await this.store.insert(index);
        if (res instanceof Error) {
          console.error(`Error inserting fee index: ${res}`);
          const feeEstId = feeEstimate.id;
          throw res;
        }
      }
      return true;
    } catch (e) {
      return handleError(e);
    }
  }

  async archiveData(
    from: Date,
    to: Date,
    stepSizeMs: number,
  ): Promise<boolean | Error> {
    try {
      const feeIndexes = await this.store.readByRange(
        from.toISOString(),
        to.toISOString(),
      );

      if (feeIndexes instanceof Error) {
        return handleError(feeIndexes);
      }

      const feeIndexesBatchedByStepSize = this.batchFeeIndexesByStepSize(
        feeIndexes,
        stepSizeMs,
      );

      if (feeIndexesBatchedByStepSize instanceof Error) {
        console.error("Error batching fee estimates! ");
        return handleError(feeIndexesBatchedByStepSize);
      }

      const feeIndexesToArchive: FeeIndexesArchiveBulkInsert[] = [];

      feeIndexesBatchedByStepSize.forEach((indexes) => {
        const average = calculateFeeIndexWeightedAverage(
          indexes,
        );

        const feeEstimateArchive: FeeIndexesArchiveBulkInsert = {
          startTime: indexes[0].time,
          endTime: indexes[indexes.length - 1].time,
          avgRatioLast365Days: average.weightedAverage365Days,
          avgRatioLast30Days: average.weightedAverage30Days,
        };

        feeIndexesToArchive.push(feeEstimateArchive);
      });

      const isArchived = await this.store.insertManyArchive(
        feeIndexesToArchive,
      );

      if (isArchived instanceof Error) {
        return handleError(isArchived);
      }
      return true;
    } catch (e) {
      return handleError(e);
    }
  }

  private batchFeeIndexesByStepSize(
    feeIndexes: FeeIndexes[],
    stepSizeMs: number,
  ): FeeIndexes[][] | Error {
    try {
      if (!feeIndexes.length) return [];

      const batches: FeeIndexes[][] = [];
      let batchStart = feeIndexes[0].time.getTime();
      let currentBatch: FeeIndexes[] = [];

      feeIndexes.forEach((estimate) => {
        if (estimate.time.getTime() < batchStart + stepSizeMs) {
          // The estimate belongs to the current batch
          currentBatch.push(estimate);
        } else {
          // The estimate starts a new batch
          batches.push(currentBatch); // Push the completed batch
          batchStart += stepSizeMs; // Update the start time for the new batch

          // Ensure the new batch start aligns with the estimate that exceeded the previous batch
          while (estimate.time.getTime() >= batchStart + stepSizeMs) {
            batchStart += stepSizeMs;
          }

          currentBatch = [estimate]; // Start a new batch with the current estimate
        }
      });

      // Don't forget to add the last batch if it's not empty
      if (currentBatch.length > 0) {
        batches.push(currentBatch);
      }

      return batches;
    } catch (e) {
      console.error(e); // Modify as needed to handle the error properly
      return handleError(e);
    }
  }
}
