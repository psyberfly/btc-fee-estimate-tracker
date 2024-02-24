import { makeApiCall } from "../lib/network/network";
import { IDataOp, IndexResponse } from "./interface";

export class DataOp implements IDataOp {
  async fetchAllTime(): Promise<IndexResponse[] | Error> {
    try {
      const baseUrl = import.meta.env.VITE_FEE_WATCHER_PUBLIC_API_URL;
      const feeHistoryUrl = baseUrl + "/indexHistory";
      const res = await makeApiCall(
        feeHistoryUrl,
        "GET",
      );

      if (res instanceof Error) {
        throw res;
      }

      let data: IndexResponse[] = [];

      res.forEach((element) => {
        const feeIndex: IndexResponse = {
          timestamp: element["timestamp"],
          feeEstimateMovingAverageRatio: {
            last365Days:
              element["feeEstimateMovingAverageRatio"]["last365Days"],
            last30Days: element["feeEstimateMovingAverageRatio"]["last30Days"],
          },
          currentFeeEstimate: {
            satsPerByte: element["currentFeeEstimate"]["satsPerByte"],
            time: element["currentFeeEstimate"]["time"]
          },
          movingAverage: {
            createdAt: element["movingAverage"]["createdAt"],
            last365Days: element["movingAverage"]["last365Days"],
            last30Days: element["movingAverage"]["last30Days"],
          },
        };

        data.push(feeIndex);
      });
      return data;
    } catch (e) {
      return e;
    }
  }
}
