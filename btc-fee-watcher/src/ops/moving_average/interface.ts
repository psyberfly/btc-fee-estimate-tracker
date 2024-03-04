import { MovingAverage } from "@prisma/client";

export interface IMovingAverageOp {
  readLatest(): Promise<MovingAverage | Error>;
  readAll(since:Date): Promise<Error | MovingAverage[]>;
  create(): Promise<boolean | Error>;
  checkExists(DateUTC: string): Promise<boolean | Error>;
}
