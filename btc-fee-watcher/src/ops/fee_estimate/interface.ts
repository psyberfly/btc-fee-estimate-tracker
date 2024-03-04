import { FeeEstimate } from "@prisma/client";

export interface IFeeEstimateOp {
  readAll(since:Date): Promise<FeeEstimate[] | Error>;
  readLast365Days(): Promise<FeeEstimate[] | Error>;
  readLast30Days(): Promise<FeeEstimate[] | Error>;
  readLatest(): Promise<FeeEstimate | Error>;
  updateCurrent(): Promise<boolean | Error>;
  seedHistory(history: FeeEstimate[]): Promise<boolean | Error>;
}
