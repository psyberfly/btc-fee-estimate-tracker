import Dexie, { Table } from "dexie";
import { FeeIndex, MovingAverage, FeeEstimate } from "./interface";

export class MySubClassedDexie extends Dexie {
  feeIndex!: Table<FeeIndex>;
  movingAverages!: Table<MovingAverage>;
  feeEstimates!: Table<FeeEstimate>;

  constructor() {
    super("btcFee");
    this.version(3).stores({
      feeIndex: "time, ratioLast365Days, ratioLast30Days", // Primary key and indexed props
      movingAverages: "day, last365Days, last30Days",
      feeEstimates: "time, satsPerByte",
    });
  }
}

export const db = new MySubClassedDexie();
