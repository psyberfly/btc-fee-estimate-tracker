import { IMovingAverageOp } from "./interface";
import { FeeOp } from "../fee_estimate/fee_estimate";
import { handleError } from "../../lib/errors/e";
import { MovingAverage } from "@prisma/client";
import { Decimal } from "@prisma/client/runtime/library";
import { MovingAveragePrismaStore } from "./store/prisma";

export class MovingAverageOp implements IMovingAverageOp {
  private feeOp = new FeeOp();
  private store = new MovingAveragePrismaStore();

  async readLatest(): Promise<Error | MovingAverage> {
    const latestMovingAvg = await this.store.readLatest();
    if (latestMovingAvg instanceof Error) {
      return handleError(latestMovingAvg);
    }
    return latestMovingAvg;
  }

  async checkExists(dateUTC: string): Promise<boolean | Error> {
    const exists = await this.store.checkRowExistsByDate(dateUTC);

    if (exists instanceof Error) {
      return handleError(exists);
    }

    return exists;
  }

  async create(): Promise<boolean | Error> {
    try {
      const feeHistoryLastYear = await this.feeOp.readLast365Days();

      if (feeHistoryLastYear instanceof Error) {
        return feeHistoryLastYear;
      }
      if (feeHistoryLastYear.length === 0) {
        throw new Error("Array is empty, cannot calculate average.");
      }

      const yearlySum = feeHistoryLastYear.reduce(
        (acc, curr) => acc + curr.satsPerByte.toNumber(),
        0,
      );

      const yearlyAverage = yearlySum / feeHistoryLastYear.length;

      const feeHistoryLastMonth = await this.feeOp.readLast30Days();

      if (feeHistoryLastMonth instanceof Error) {
        return feeHistoryLastMonth;
      }
      if (feeHistoryLastMonth.length === 0) {
        throw new Error("Array is empty, cannot calculate average.");
      }

      const monthlySum = feeHistoryLastMonth.reduce(
        (acc, curr) => acc + curr.satsPerByte.toNumber(),
        0,
      );

      const monthlyAverage = monthlySum / feeHistoryLastMonth.length;

      const update: MovingAverage = {
        id: null, //Added by DB
        createdAt: null, //Added by DB
        last365Days: new Decimal(yearlyAverage),
        last30Days: new Decimal(monthlyAverage),
      };

      this.store.insert(update);
      return true;
    } catch (e) {
      return handleError(e);
    }
  }
}
