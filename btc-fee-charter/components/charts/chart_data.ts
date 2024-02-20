import { ChartData } from "chart.js";
import { IndexResponse } from "./interface";
import { ChartDataset } from "chart.js";


export class ChartOp {
  parseApiData(apiRes: any): IndexResponse[] | Error {
    try {
      let feeIndexHistory: IndexResponse[] = [];

      apiRes.forEach((element) => {
        const feeIndex: IndexResponse = {
          timestamp: element["timestamp"],
          feeEstimateMovingAverageRatio: {
            last365Days:
              element["feeEstimateMovingAverageRatio"]["last365Days"],
            last30Days: element["feeEstimateMovingAverageRatio"]["last30Days"],
          },
          currentFeeEstimate: {
            satsPerByte: element["currentFeeEstimate"]["satsPerByte"],
          },
          movingAverage: {
            createdAt: element["movingAverage"]["createdAt"],
            last365Days: element["movingAverage"]["last365Days"],
            last30Days: element["movingAverage"]["last30Days"],
          },
        };

        feeIndexHistory.push(feeIndex);
      });
      return feeIndexHistory;
    } catch (e) {
      return e;
    }
  }

  // getChartDataFeeIndex(feeIndexHistory: IndexResponse[]): ChartData | Error {
  //   try {
  //     interface MyObject {
  //       x: Date;
  //       y: number;
  //       // Add more properties as needed
  //   }
  //     const dataSet30Day:MyObject[] = [];
  //     const dataSet365Day= [];
  //     feeIndexHistory.forEach((element) => {
  //       dataSet30Day.push({
  //         "x": element.timestamp,
  //         "y": element.feeEstimateMovingAverageRatio.last30Days,
  //       });
  //       dataSet365Day.push({
  //         "x": element.timestamp,
  //         "y": element.feeEstimateMovingAverageRatio.last365Days,
  //       });
  //     });


  //     const dataFeeIndexChart: ChartData = {
  //       datasets: [
  //         {
  //           label: "Current Fee Estimate : Moving Average last 30 days",
  //           data: [],
  //           borderColor: "rgb(255, 99, 132)",
  //           backgroundColor: "rgba(255, 99, 132, 0.5)",
  //         },
  //         {
  //           label: "Current Fee Estimate : Moving Average last 365 days",
  //           data: dataSet365Day,
  //           borderColor: "rgb(53, 162, 235)",
  //           backgroundColor: "rgba(53, 162, 235, 0.5)",
  //         },
  //       ],
  //     };
  //     return dataFeeIndexChart;
  //   } catch (e) {
  //     return e;
  //   }
  // }

  getChartDataMovingAverage(feeIndexHistory: IndexResponse[]): any | Error {
    try {
      const dataSetMovingAvg30Day: {}[] = [];
      const dataSetMovingAvg365Day: {}[] = [];

      feeIndexHistory.forEach((element) => {
        dataSetMovingAvg30Day.push({
          "x": element.movingAverage.createdAt,
          "y": element.feeEstimateMovingAverageRatio.last30Days,
        });
        dataSetMovingAvg365Day.push({
          "x": element.movingAverage.createdAt,
          "y": element.feeEstimateMovingAverageRatio.last365Days,
        });
      });

      const dataMovingAverageChart = {
        datasets: [
          {
            label: "Fee Estimate Moving Average last 30 days",
            data: dataSetMovingAvg30Day,
            borderColor: "rgb(255, 99, 132)",
            backgroundColor: "rgba(255, 99, 132, 0.5)",
          },
          {
            label: "Fee Estimate Moving Average last 365 days",
            data: dataSetMovingAvg365Day,
            borderColor: "rgb(53, 162, 235)",
            backgroundColor: "rgba(53, 162, 235, 0.5)",
          },
        ],
      };

      return dataMovingAverageChart;
    } catch (e) {
      return e;
    }
  }
}
