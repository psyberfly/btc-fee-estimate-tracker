import Dexie, { Table } from "dexie";
import { FeeEstimate, FeeIndex, MovingAverage } from "../chart_data/interface";

export class MySubClassedDexie extends Dexie {
  feeIndex!: Table<FeeIndex>;
  movingAverages!: Table<MovingAverage>;
  feeEstimates!: Table<FeeEstimate>;

  constructor() {
    super("btcFee");
    this.version(1).stores({
      feeIndex: "createdAt, ratioLast365Days, ratioLast30Days", // Primary key and indexed props
      movingAverages: "createdAt, last365Days, last30Days",
      feeEstimates: "time, satsPerByte"
    });
  }
}

export const db = new MySubClassedDexie();
