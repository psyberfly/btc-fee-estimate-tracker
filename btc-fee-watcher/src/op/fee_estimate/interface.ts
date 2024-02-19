//FEE ESTIMATE
import { FeeEstimate } from "@prisma/client";

// export interface FeeEstimate {
//   id: number;
//   time: String; //UTC
//   satsPerByte: number; //1-2 blocks/fastest
// }

export interface IFeeEstimateOp {
  readLast365Days(): Promise<FeeEstimate[] | Error>;
  readLast30Days(): Promise<FeeEstimate[] | Error>;
  readLatest(): Promise<FeeEstimate | Error>;
  updateCurrent(): Promise<boolean | Error>;
}
