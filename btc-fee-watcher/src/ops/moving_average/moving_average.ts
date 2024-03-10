import { IMovingAverageOp } from "./interface";
import { FeeOp } from "../fee_estimate/fee_estimate";
import { handleError } from "../../lib/errors/e";
import { Decimal } from "@prisma/client/runtime/library";
import { MovingAveragePrismaStore } from "./store/prisma";
import { fetchDate, UTCDate } from "../../lib/date/date";
import { MovingAverages } from "@prisma/client";

export class MovingAverageOp implements IMovingAverageOp {
  private feeOp = new FeeOp();
  private store = new MovingAveragePrismaStore();

  async readAll(since: Date): Promise<Error | MovingAverages[]> {
    const all = await this.store.readAll(since);
    if (all instanceof Error) {
      return handleError(all);
    }
    return all;
  }

  async readLatest(): Promise<Error | MovingAverages> {
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

  async seed(since: Date): Promise<boolean | Error> {
    try {
      //read all fee estimates from since to today
      const feeEstimates = await this.feeOp.readAll(since);

      if (feeEstimates instanceof Error) {
        console.error("Error reading fee estimates from DB!");
        throw feeEstimates;
      }
      //for each fee estimate in fee estimates: create days: Date[] = all days (24h window) across all fee estimates
      const uniqueDayStrings = new Set<string>();

      feeEstimates.forEach((item) => {
        // Format to YYYY-MM-DD string to normalize time out of equation
        const dayString = item.time.toISOString().split("T")[0];
        uniqueDayStrings.add(dayString);
      });

      // Convert each unique date string back into a Date object at 00:00:00 hours
      const uniqueDays = Array.from(uniqueDayStrings).map((dayStr) =>
        new Date(dayStr)
      );

      uniqueDays.forEach((day) => {
        //compute moving average
        this.create(day);
      });

      return true;
    } catch (e) {
      return handleError(e);
    }
  }

  async create(day: Date): Promise<boolean | Error> {
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

      const feeHistoryLast365Days = await this.feeOp.readLast365Days(day);

      if (feeHistoryLast365Days instanceof Error) {
        return feeHistoryLast365Days;
      }
      if (feeHistoryLast365Days.length === 0) {
        throw new Error("Array is empty, cannot calculate average.");
      }
      const averageLast365Days = calculateWeightedAverage(
        feeHistoryLast365Days,
      );

      const feeHistoryLast30Days = await this.feeOp.readLast30Days(day);
      if (feeHistoryLast30Days instanceof Error) {
        return feeHistoryLast30Days;
      }
      if (feeHistoryLast30Days.length === 0) {
        throw new Error("Array is empty, cannot calculate average.");
      }
      const averageLast30Days = calculateWeightedAverage(feeHistoryLast30Days);

      const update: MovingAverages = {
        id: null, // Added by DB
        day: day,
        createdAt: null, //Added by DB,
        last365Days: averageLast365Days,
        last30Days: averageLast30Days,
      };

      this.store.insert(update);
      return true;
    } catch (e) {
      return handleError(e);
    }
  }
}
