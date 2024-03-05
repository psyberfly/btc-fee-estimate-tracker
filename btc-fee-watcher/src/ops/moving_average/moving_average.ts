import { IMovingAverageOp } from "./interface";
import { FeeOp } from "../fee_estimate/fee_estimate";
import { handleError } from "../../lib/errors/e";
import { MovingAverage } from "@prisma/client";
import { Decimal } from "@prisma/client/runtime/library";
import { MovingAveragePrismaStore } from "./store/prisma";
import { fetchDate, UTCDate } from "../../lib/date/date";

export class MovingAverageOp implements IMovingAverageOp {
  private feeOp = new FeeOp();
  private store = new MovingAveragePrismaStore();

  async readAll(since: Date): Promise<Error | MovingAverage[]> {
    const all = await this.store.readAll(since);
    if (all instanceof Error) {
      return handleError(all);
    }
    return all;
  }

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

  // async seed(since: Date):Promise<boolean | Error>{
  //   //read all fee estimates from since to today
  //   const feeEstimates = this.feeOp.readAll(since);
        
  //   //for each fee estimate in fee estimates: create days: Date[] = all days (24h window) across all fee estimates 



  //   //for each day:
  //   //compute moving average 

  // };

  async create(): Promise<boolean | Error> {
    try {
      const calculateWeightedAverage = (
        feeHistory: Array<{ id: number; time: Date; satsPerByte: Decimal }>,
      ) => {
        let weightedSum = 0;
        let totalWeight = 0;

        for (let i = 0; i < feeHistory.length - 1; i++) {
          const stepSizeHours =
            (feeHistory[i + 1].time.getTime() - feeHistory[i].time.getTime()) /
            (1000 * 60 * 60); // Difference in hours
          const weight = stepSizeHours; // Directly using step size in hours as weight
          weightedSum += feeHistory[i].satsPerByte.toNumber() * weight;
          totalWeight += weight;
        }

        // Handle last reading separately (assuming average of total weight as the penultimate step or default to 1 if only one reading)
        const lastWeight = totalWeight > 0
          ? totalWeight / (feeHistory.length - 1)
          : 1;
        weightedSum +=
          feeHistory[feeHistory.length - 1].satsPerByte.toNumber() * lastWeight;
        totalWeight += lastWeight;

        const weightedMovingAverage = new Decimal(weightedSum / totalWeight);
        return weightedMovingAverage;
      };

      const feeHistoryLastYear = await this.feeOp.readLast365Days();

      if (feeHistoryLastYear instanceof Error) {
        return feeHistoryLastYear;
      }
      if (feeHistoryLastYear.length === 0) {
        throw new Error("Array is empty, cannot calculate average.");
      }
      const yearlyAverage = calculateWeightedAverage(feeHistoryLastYear);

      const feeHistoryLastMonth = await this.feeOp.readLast30Days();
      if (feeHistoryLastMonth instanceof Error) {
        return feeHistoryLastMonth;
      }
      if (feeHistoryLastMonth.length === 0) {
        throw new Error("Array is empty, cannot calculate average.");
      }
      const monthlyAverage = calculateWeightedAverage(feeHistoryLastMonth);

      const update: MovingAverage = {
        id: null, // Added by DB
        createdAt: null, // Added by DB
        last365Days: yearlyAverage,
        last30Days: monthlyAverage,
      };

      this.store.insert(update);
      return true;
    } catch (e) {
      return handleError(e);
    }
  }
}
