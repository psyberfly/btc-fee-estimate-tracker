import { FeeEstimates, MovingAverages } from "@prisma/client";

export interface IMovingAverageOp {
  readLatest(): Promise<MovingAverages | Error>;
  readAll(since: Date, isHistoric?:boolean): Promise<Error | MovingAverages[]>;
  create(day: Date): Promise<boolean | Error>;
  seed(since: Date): Promise<boolean | Error>;
  checkExists(DateUTC: string): Promise<boolean | Error>;
}
