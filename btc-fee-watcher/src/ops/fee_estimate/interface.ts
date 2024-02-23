import { FeeEstimate } from "@prisma/client";

export interface IFeeEstimateOp {
  readLast365Days(): Promise<FeeEstimate[] | Error>;
  readLast30Days(): Promise<FeeEstimate[] | Error>;
  readLatest(): Promise<FeeEstimate | Error>;
  updateCurrent(): Promise<boolean | Error>;
  storeHistoric(history: FeeEstimate[]): Promise<boolean | Error>;
}
