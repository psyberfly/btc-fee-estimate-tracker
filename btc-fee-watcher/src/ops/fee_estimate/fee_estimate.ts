import { fetchDate, UTCDate } from "../../lib/date/date";
import { FeeEstimatesArchiveBulkInsert, IFeeEstimateOp } from "./interface";
// import { FeeEstPgStore } from "./store/pg";
import { makeApiCall } from "../../lib/network/network";
import { handleError } from "../../lib/errors/e";
import { FeeEstimatePrismaStore } from "./store/prisma";
import { FeeEstimates, FeeEstimatesArchive } from "@prisma/client";
import { Decimal } from "@prisma/client/runtime/library";
import { calculateFeeEstimateWeightedAverage } from "../../lib/math/average";

export class FeeOp implements IFeeEstimateOp {
  private mempoolApiUrl = "https://mempool.space/api/v1/fees/recommended";
  // private store = new FeeEstPgStore();
  private store = new FeeEstimatePrismaStore();

  async readLatest(): Promise<FeeEstimates | Error> {
    const res = await this.store.readLatest();
    return res;
  }

  async readLast365Days(since: Date): Promise<FeeEstimates[] | Error> {
    const endDate = since;
    const startDate = new Date(since);
    startDate.setDate(startDate.getDate() - 365);

    try {
      const res = await this.store.readByRange(
        startDate.toISOString(),
        endDate.toISOString(),
      );
      if (res instanceof Error) {
        throw (`Store error: ${res}`);
      } else if (res.length < 1) {
        throw ("No fee estimates found in last 365Days");
      }
      return res;
    } catch (error) {
      console.error("Error fetching data:", error);
      return new Error("Error fetching data.");
    }
  }

  async readLast30Days(since: Date): Promise<FeeEstimates[] | Error> {
    const endDate = since;
    const startDate = new Date(since);
    startDate.setDate(startDate.getDate() - 30);

    const res = await this.store.readByRange(
      startDate.toISOString(),
      endDate.toISOString(),
    );
    if (res instanceof Error) {
      throw (`Store error: ${res}`);
    } else if (res.length < 1) {
      throw ("No fee estimates found in last 30Days");
    }
    return res;
  }

  async readAll(since: Date, isHistoric?:boolean): Promise<FeeEstimates[]  | Error> {
    const res = await this.store.readAll(since, isHistoric);
    return res;
  }

  async readAllArchived(since: Date, isHistoric?:boolean): Promise<FeeEstimatesArchive[] | Error> {
    const res = await this.store.readAllArchived(since, isHistoric);
    return res;
  }


  async create(): Promise<FeeEstimates | Error> {
    const res = await makeApiCall(this.mempoolApiUrl, "GET");

    if (res instanceof Error) {
      console.error("Error fetching fee estimate from API!");
      return handleError(res);
    }

    const satsPerByte = res["fastestFee"];

    if (!satsPerByte) {
      return handleError({
        code: 404,
        message: "Null Fee Estimate fetched from API",
      });
    }

    const currentfeeEstimate: FeeEstimates = {
      time: new Date(),
      satsPerByte: satsPerByte,
      createdAt: null, //Added by DB
      id: null, //Added by DB,
    };

    const insertedFeeEst = await this.store.insert(currentfeeEstimate);

    if (res instanceof Error) {
      return handleError(res);
    }

    return insertedFeeEst;
  }

  async seedHistory(history: FeeEstimates[]): Promise<boolean | Error> {
    const count = await this.store.checkCount();
    if (count instanceof Error) {
      return handleError(count);
    }

    if (count > 0) {
      return handleError(
        Error(
          `Error seeding DB: FeeEstimates table is not empty. Row count: ${count}. Aborting seeding.`,
        ),
      );
    }

    const res = await this.store.insertMany(history);
    if (res instanceof Error) {
      return handleError(res);
    }
    return true;
  }

  async archiveData(
    from: Date,
    to: Date,
    stepSizeMs: number,
  ): Promise<boolean | Error> {
    try {
      const feeEstimates = await this.store.readByRange(
        from.toISOString(),
        to.toISOString(),
      );

      if (feeEstimates instanceof Error) {
        return handleError(feeEstimates);
      }

      const feeEstimatesBatchedByStepSize = this.batchFeeEstimatesByStepSize(
        feeEstimates,
        stepSizeMs,
      );

      if (feeEstimatesBatchedByStepSize instanceof Error) {
        console.error("Error batching fee estimates! ");
        return handleError(feeEstimatesBatchedByStepSize);
      }

      const feeEstimatesToArchive: FeeEstimatesArchiveBulkInsert[] = [];

      feeEstimatesBatchedByStepSize.forEach((estimates) => {
        const feeEstimatesAverage: Decimal = calculateFeeEstimateWeightedAverage(
          estimates,
        );

        const feeEstimateArchive: FeeEstimatesArchiveBulkInsert = {
          startTime: estimates[0].time,
          endTime: estimates[estimates.length - 1].time,
          avgSatsPerByte: feeEstimatesAverage,
        };

        feeEstimatesToArchive.push(feeEstimateArchive);
      });

      const isArchived = await this.store.insertManyArchive(
        feeEstimatesToArchive,
      );

      if (isArchived instanceof Error) {
        return handleError(isArchived);
      }
      return true;
    } catch (e) {
      return handleError(e);
    }
  }
  private batchFeeEstimatesByStepSize(
    feeEstimates: FeeEstimates[],
    stepSizeMs: number,
  ): FeeEstimates[][] | Error {
    try {
      if (!feeEstimates.length) return [];

      const batches: FeeEstimates[][] = [];
      let batchStart = feeEstimates[0].time.getTime();
      let currentBatch: FeeEstimates[] = [];

      feeEstimates.forEach((estimate) => {
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
