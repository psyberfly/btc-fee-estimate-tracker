import { FeeEstimate } from "@prisma/client";

export interface IFeeEstimateOp {
  readAll(since:Date): Promise<FeeEstimate[] | Error>;
  readLast365Days(since:Date): Promise<FeeEstimate[] | Error>;
  readLast30Days(): Promise<FeeEstimate[] | Error>;
  readLatest(): Promise<FeeEstimate | Error>;
  create(): Promise<FeeEstimate | Error>;
  seedHistory(history: FeeEstimate[]): Promise<boolean | Error>;
}
