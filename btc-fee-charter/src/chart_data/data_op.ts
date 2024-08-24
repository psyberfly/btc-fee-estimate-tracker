import { AxiosHeaders, AxiosRequestHeaders } from "axios";
import { makeApiCall } from "../lib/network";
import { IDataOp, IndexDetailed } from "./interface";
import { FeeEstimate, FeeIndex, MovingAverage } from "../store/interface";

export class DataOp implements IDataOp {
 
  private baseUrl = import.meta.env.VITE_FEE_WATCHER_PUBLIC_API_URL;
  private apiKey = import.meta.env.VITE_FEE_WATCHER_API_KEY;

  async fetchIndexDetailed(): Promise<Error | IndexDetailed> {
    try {
      const url = this.baseUrl + `/indexDetailed`;
      const headers: AxiosHeaders = AxiosHeaders.from({
        'x-api-key': this.apiKey,
        //'Accept-Encoding': 'gzip',
      });
      const res = await makeApiCall(
        url,
        "GET",
      headers
        );

      if (res instanceof Error) {
        console.error(res);
        return res;
      }
      let data: IndexDetailed = res;
      return data;
    } catch (e) {
      return e;
    }
  }

  async fetchFeeEstimateHistory(since: Date): Promise<FeeEstimate[] | Error> {
    try {
      const sinceUnixTime = since.getTime();
      const url = this.baseUrl + `/feeEstimateHistory?since=${sinceUnixTime}`;
      const res = await makeApiCall(
        url,
        "GET",
        AxiosHeaders.from(`x-api-key: ${this.apiKey}`),
      );

      if (res instanceof Error) {
        console.error(res);
        return res;
      }

      let data: FeeEstimate[] = [];

      res.forEach((element) => {
        const feeEstimate: FeeEstimate = {
          time: element["time"],
          satsPerByte: parseFloat(element["satsPerByte"]),
        };
        data.push(feeEstimate);
      });
      return data;
    } catch (e) {
      return e;
    }
  }

  async fetchMovingAverageHistory(
    since: Date,
  ): Promise<MovingAverage[] | Error> {
    try {
      const sinceUnixTime = since.getTime();
      const url = this.baseUrl + `/movingAverageHistory?since=${sinceUnixTime}`;
      const res = await makeApiCall(
        url,
        "GET",
        AxiosHeaders.from(`x-api-key: ${this.apiKey}`),
      );

      if (res instanceof Error) {
        console.error(res);
        throw res;
      }

      let data: MovingAverage[] = [];

      res.forEach((element) => {
        const movingAverage: MovingAverage = {
          time: element["day"],
          last30Days: parseFloat(element["last30Days"]),
          last365Days: parseFloat(element["last365Days"]),
        };
        data.push(movingAverage);
      });
      return data;
    } catch (e) {
      return e;
    }
  }

  async fetchFeeIndexHistory(since: Date): Promise<Error | FeeIndex[]> {
    try {
      const sinceUnixTime = since.getTime();
      const url = this.baseUrl + `/indexHistory?since=${sinceUnixTime}`;
      const res = await makeApiCall(
        url,
        "GET",
        AxiosHeaders.from(`x-api-key: ${this.apiKey}`),
      );

      if (res instanceof Error) {
        console.error(res);
        throw res;
      }

      let data: FeeIndex[] = [];

      res.forEach((element) => {
        const index: FeeIndex = {
          time: (element["time"]),
          ratioLast30Days: (element["ratioLast30Days"]),
          ratioLast365Days: (element["ratioLast365Days"]),
        };
        data.push(index);
      });

    
      return data;
    } catch (e) {
      return e;
    }
  }

  // async fetchIndexDetailedHistory(): Promise<IndexDataResponse | Error> {
  //   try {
  //     const url = this.baseUrl + "/indexHistoryDetailed";
  //     const res = await makeApiCall(
  //       url,
  //       "GET",
  //       AxiosHeaders.from(`x-api-key: ${this.apiKey}`),
  //     );

  //     if (res instanceof Error) {
  //       throw res;
  //     }

  //     let data: IndexResponse[] = [];

  //     res.forEach((element) => {
  //       const feeIndex: IndexResponse = {
  //         timestamp: element["timestamp"],
  //         feeEstimateMovingAverageRatio: {
  //           last365Days:
  //             element["feeEstimateMovingAverageRatio"]["last365Days"],
  //           last30Days: element["feeEstimateMovingAverageRatio"]["last30Days"],
  //         },
  //         currentFeeEstimate: {
  //           satsPerByte: element["currentFeeEstimate"]["satsPerByte"],
  //           time: element["currentFeeEstimate"]["time"],
  //         },
  //         movingAverage: {
  //           createdAt: element["movingAverage"]["createdAt"],
  //           last365Days: element["movingAverage"]["last365Days"],
  //           last30Days: element["movingAverage"]["last30Days"],
  //         },
  //       };
  //       data.push(feeIndex);
  //     });

  //     const dataLastUpdated = data[0].timestamp;

  //     const dataRes: IndexDataResponse = {
  //       data: data,
  //       lastUpdated: dataLastUpdated,
  //     };

  //     return dataRes;
  //   } catch (e) {
  //     return e;
  //   }
  // }
}
