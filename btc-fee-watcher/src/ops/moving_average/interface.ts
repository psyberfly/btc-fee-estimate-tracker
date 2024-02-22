import { MovingAverage } from "@prisma/client";

export interface IMovingAverageOp {
  //invoked daily
  readLatest(): Promise<MovingAverage | Error>;
  create(): Promise<boolean | Error>;
  checkExists(DateUTC: string): Promise<boolean | Error>;
}
