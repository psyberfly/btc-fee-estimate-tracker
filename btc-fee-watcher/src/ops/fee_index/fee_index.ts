import { FeeEstimate, FeeIndex } from "@prisma/client";
import { handleError } from "../../lib/errors/e";
import { FeeOp } from "../fee_estimate/fee_estimate";
import { IIndexOp, FeeIndexDetailed } from "./interface";
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

  async readAllDetailed(): Promise<FeeIndexDetailed[] | Error> {
    const res = await this.store.fetchAllDetailed();
    if (res instanceof Error) {
      return handleError(res);
    }

    return res;
  }

  async readAll(since: Date): Promise<FeeIndex[] | Error> {
    const res = await this.store.fetchAll(since);
    if (res instanceof Error) {
      return handleError(res);
    }

    return res;
  }

  async seed(since: Date):Promise<boolean | Error>{
    try {
      //read all fee estimates from since to today
      const feeEstimates = await this.feeOp.readAll(since);

      if (feeEstimates instanceof Error) {
        console.error("Error reading fee estimates from DB!");
        throw feeEstimates;
      }

      feeEstimates.forEach((feeEstimate) => {
        //compute moving average
        this.create(feeEstimate);
      });

      return true;
    } catch (e) {
      return handleError(e);
    }

   };


  async create(feeEstimate:FeeEstimate): Promise<boolean | Error> {
       const movingAverage = await this.movingAvgStore.readByDay(feeEstimate.time);

    if (movingAverage instanceof Error) {
      return handleError(movingAverage);
    }

    const ratioLast365Days = feeEstimate.satsPerByte.toNumber() /
      movingAverage.last365Days.toNumber();

    const ratioLast30Days = feeEstimate.satsPerByte.toNumber() /
      movingAverage.last30Days.toNumber();

    const index: FeeIndex = {
      id: null, //added by DB
      feeEstimateId: feeEstimate.id,
      movingAverageId: movingAverage.id,
      ratioLast365Days: new Decimal(ratioLast365Days),
      ratioLast30Days: new Decimal(ratioLast30Days),
      createdAt: null, //added by DB
    };

    this.store.insert(index);
    return true;
  }
}
