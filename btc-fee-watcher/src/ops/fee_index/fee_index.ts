import { FeeEstimates, FeeIndexes } from "@prisma/client";
import { handleError } from "../../lib/errors/e";
import { FeeOp } from "../fee_estimate/fee_estimate";
import { FeeIndexDetailed, IIndexOp } from "./interface";
import { FeeIndexPrismaStore } from "./store/prisma";
import { MovingAveragePrismaStore } from "../moving_average/store/prisma";
import { FeeEstimatePrismaStore } from "../fee_estimate/store/prisma";
import { Decimal } from "@prisma/client/runtime/library";

export class IndexOp implements IIndexOp {
  private feeOp = new FeeOp();
  private store = new FeeIndexPrismaStore();
  private movingAvgStore = new MovingAveragePrismaStore();
  private feeEstStore = new FeeEstimatePrismaStore();

  async readLatest(): Promise<FeeIndexDetailed | Error> {
    const res = await this.store.fetchLatest();
    if (res instanceof Error) {
      return handleError(res);
    }

    return res;
  }

  async readAllDetailed(from:Date): Promise<FeeIndexDetailed[] | Error> {
    const res = await this.store.fetchDetailed90Days(from);
    if (res instanceof Error) {
      return handleError(res);
    }

    return res;
  }

  async readAll(since: Date): Promise<FeeIndexes[] | Error> {
    const res = await this.store.fetchAll(since);
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
      const feeEstToSeed = feeEstimates.length;

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
}
