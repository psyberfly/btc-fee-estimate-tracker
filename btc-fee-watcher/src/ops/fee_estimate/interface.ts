import { FeeEstimates } from "@prisma/client";

export interface IFeeEstimateOp {
  readAll(since: Date): Promise<FeeEstimates[] | Error>;
  readLast365Days(since: Date): Promise<FeeEstimates[] | Error>;
  readLast30Days(since: Date): Promise<FeeEstimates[] | Error>;
  readLatest(): Promise<FeeEstimates | Error>;
  create(): Promise<FeeEstimates | Error>;
  seedHistory(history: FeeEstimates[]): Promise<boolean | Error>;
}
