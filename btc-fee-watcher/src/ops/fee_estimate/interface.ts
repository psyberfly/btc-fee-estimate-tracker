import { FeeEstimates, FeeEstimatesArchive } from "@prisma/client";

//used for bulk insert
export type FeeEstimatesArchiveBulkInsert = Omit<FeeEstimatesArchive, 'id'| 'createdAt'>;

export interface IFeeEstimateOp {
  readAll(since: Date): Promise<FeeEstimates[] | Error>;
  readLast365Days(since: Date): Promise<FeeEstimates[] | Error>;
  readLast30Days(since: Date): Promise<FeeEstimates[] | Error>;
  readLatest(): Promise<FeeEstimates | Error>;
  create(): Promise<FeeEstimates | Error>;
  seedHistory(history: FeeEstimates[]): Promise<boolean | Error>;
  archiveData(from:Date,to:Date, stepSizeMs: number): Promise<boolean | Error>;
  readAllArchived(since:Date): Promise<FeeEstimatesArchive[] | Error>;
}
