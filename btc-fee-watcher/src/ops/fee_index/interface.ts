import {
  FeeEstimates,
  FeeIndexes,
  FeeIndexesArchive,
  MovingAverages,
} from "@prisma/client";

export interface FeeIndexDetailed {
  time: Date;
  feeEstimateMovingAverageRatio: {
    last365Days: number;
    last30Days: number;
  };
  currentFeeEstimate: {
    time: Date;
    satsPerByte: number;
  };
  movingAverage: {
    day: Date;
    last365Days: number;
    last30Days: number;
  };
}

export type FeeIndexesArchiveBulkInsert = Omit<
  FeeIndexesArchive,
  "id" | "createdAt"
>;

export interface IIndexOp {
  readAll(since: Date, isHistoric?:boolean): Promise<FeeIndexes[] | Error>;
  readAllDetailed(since: Date): Promise<FeeIndexDetailed[] | Error>;
  create(
    feeEstimate: FeeEstimates,
    movingAverage: MovingAverages,
  ): Promise<boolean | Error>;
  seed(since: Date): Promise<boolean | Error>;
  readLatestDetailed(): Promise<FeeIndexDetailed | Error>;
  archiveData(
    from: Date,
    to: Date,
    stepSizeMs: number,
  ): Promise<boolean | Error>;
  readAllArchived(since: Date, isHistoric?:boolean): Promise<FeeIndexesArchive[] | Error>;
}
