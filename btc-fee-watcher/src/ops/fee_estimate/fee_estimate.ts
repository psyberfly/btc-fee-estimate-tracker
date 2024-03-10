import { fetchDate, UTCDate } from "../../lib/date/date";
import { IFeeEstimateOp } from "./interface";
// import { FeeEstPgStore } from "./store/pg";
import { makeApiCall } from "../../lib/network/network";
import { handleError } from "../../lib/errors/e";
import { FeeEstimatePrismaStore } from "./store/prisma";
import { FeeEstimates } from "@prisma/client";

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

  async readAll(since: Date): Promise<FeeEstimates[] | Error> {
    const res = await this.store.readAll(since);
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
}
