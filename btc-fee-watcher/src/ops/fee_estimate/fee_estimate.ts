import { fetchDate, UTCDate } from "../../lib/date/date";
import { IFeeEstimateOp } from "./interface";
// import { FeeEstPgStore } from "./store/pg";
import { makeApiCall } from "../../lib/network/network";
import { handleError } from "../../lib/errors/e";
import { FeeEstimatePrismaStore } from "./store/prisma";
import { FeeEstimate } from "@prisma/client";

export class FeeOp implements IFeeEstimateOp {

  private mempoolApiUrl = "https://mempool.space/api/v1/fees/recommended";
  // private store = new FeeEstPgStore();
  private store = new FeeEstimatePrismaStore();

  async readLatest(): Promise<FeeEstimate | Error> {
    const res = await this.store.readLatest();
    return res;
  }

  async readLast365Days(since: Date): Promise<FeeEstimate[] | Error> {
    // Assuming fetchDate is a function to format or validate the date, apply it directly to 'since'
    const startDate = since;
    // Calculate the date 365 days after 'since' using setDate and getDate
    const endDate = new Date(startDate);
    endDate.setDate(startDate.getDate() + 365);

    try {
        const res = await this.store.readByRange(startDate.toISOString(), endDate.toISOString());
        return res;
    } catch (error) {
        // Log the error or handle it as per your application's error handling strategy
        console.error("Error fetching data:", error);
        return new Error("Error fetching data.");
    }
}

  async readLast30Days(): Promise<FeeEstimate[] | Error> {
    const today = fetchDate(UTCDate.today);
    const lastMonth = fetchDate(UTCDate.lastMonth);

    const res = await this.store.readByRange(lastMonth, today);
    return res;
  }

  async readAll(since:Date): Promise<FeeEstimate[] | Error> {
        const res = await this.store.readAll(since);
    return res;
  }

  async create(): Promise<FeeEstimate | Error> {
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

    const currentfeeEstimate: FeeEstimate = {
      time: new Date(),
      satsPerByte: satsPerByte,
      id: null, //Added by DB,
    };

    const insertedFeeEst = await this.store.insert(currentfeeEstimate);

    if (res instanceof Error) {
      return handleError(res);
    }
    
    return insertedFeeEst;
  }

  async seedHistory(history: FeeEstimate[]): Promise<boolean | Error> {
    const count = await this.store.checkCount();
    if (count instanceof Error) {
      return handleError(count);
    }

    if (count > 0) {
    return handleError(Error(`Error seeding DB: FeeEstimate table is not empty. Row count: ${count}. Aborting seeding.`));
    }

    const res = await this.store.insertMany(history);
    if (res instanceof Error) {
      return handleError(res);
    }
    return true;
  }
}
