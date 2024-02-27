import { FeeEstimate, IChartDatasetOp, IndexResponse, ServiceChartType } from "./interface";

export class ChartDatasetOp implements IChartDatasetOp {
  getFromData(
    data: any,
    kind: ServiceChartType,
  ): object | Error {
    switch (kind) {
      case ServiceChartType.index:
        return this.getIndexDataset(data);
      case ServiceChartType.movingAverage:
        return this.getMovingAverageDataset(data);
      case ServiceChartType.feeEstimate:
        return this.getFeeEstimateDataset(data);
      default:
        throw new Error("This functionality is not yet implemented.");
    }
  }

  private getFeeEstimateDataset(data: FeeEstimate[]) {
    const dataSet: { x: Date; y: number }[] = [];

    data.forEach((element) => {
      dataSet.push({
        x: element.time,
        y: element.satsPerByte,
      });
    });

    const dataset = {
      datasets: [
        {
          //fill: true,
          gradient: {},

          label: "All Time",
          data: dataSet,
          borderColor: "rgb(254, 112, 2)",
          pointBorderColor: "rgba(0, 0, 0, 1)", 
          pointBackgroundColor: "rgb(254, 112, 2)",
        },
      ],
    };

    return dataset;
  }

  private getMovingAverageDataset(data: IndexResponse[]) {
    const dataSet30Day: { x: Date; y: number }[] = [];
    const dataSet365Day: { x: Date; y: number }[] = [];

    data.forEach((element) => {
      dataSet30Day.push({
        x: element.movingAverage.createdAt,
        y: element.movingAverage.last30Days,
      });
      dataSet365Day.push({
        x: element.movingAverage.createdAt,
        y: element.movingAverage.last365Days,
      });
    });
    const dataset = {
      datasets: [
        {
          //fill: true,
          gradient: {},

          label: "Last 30 days",
          data: dataSet30Day,
          borderColor: "rgb(254, 112, 2)",
          pointBorderColor: "rgba(0, 0, 0, 1)", 
          pointBackgroundColor: "rgb(254, 112, 2)",
        },
        {
          fill: true,
          gradient: {},

          label: "Last 365 days",
          data: dataSet365Day,
          borderColor: "rgb(0,228, 255)",
          pointBorderColor: "rgba(0, 0, 0, 1)", // This will be the border color of the points
          pointBackgroundColor: "rgba(75, 192, 192, 1)", // This will be the fill color of the points
        },
      ],
    };

    return dataset;
  }

  private getIndexDataset(data: IndexResponse[]) {
    const dataSet30Day: { x: Date; y: number }[] = [];
    const dataSet365Day: { x: Date; y: number }[] = [];

    data.forEach((element) => {
      dataSet30Day.push({
        x: element.timestamp,
        y: element.feeEstimateMovingAverageRatio.last30Days,
      });
      dataSet365Day.push({
        x: element.timestamp,
        y: element.feeEstimateMovingAverageRatio.last365Days,
      });
    });

    const dataset = {
      datasets: [
        {
          //fill: true,
          // gradient: {
          //   // backgroundColor: {
          //   //   axis: "y",
          //   //   colors: {
          //   //     0: "rgba(0,255,0,0.3)",
          //   //     1: "rgba(255,255,0,0.3)",
          //   //     2: "rgba(255,0,0,0.3)",
          //   //   },
          //   // },
          //   borderColor: {
          //     axis: "y",
          //     colors: {
          //       0: "rgb(0,255,0)",
          //       1: "rgb(255,255,0)",
          //       2: "rgb(255,0,0)",
          //     },
          //   },
          // },
          fill: {
            value: 1,
            above: "rgba(255,0,0,0.1)", // Area will be red above the origin
            below: "rgba(0, 255, 0,0.1)",
          },
          label: "Last 30 days",
          data: dataSet30Day,
          borderColor: "rgb(254, 112, 2)",
          pointBorderColor: "rgba(0, 0, 0, 1)", 
          pointBackgroundColor: "rgb(254, 112, 2)",
        },
        {
          //fill: true,
          gradient: {
            // backgroundColor: {
            //   axis: "y",
            //   colors: {
            //     0: "rgba(0,255,0,0.3)",
            //     1: "rgba(255,255,0,0.3)",
            //     2: "rgba(255,0,0,0.3)",
            //   },
            // },
            // borderColor: {
            //   axis: "y",
            //   colors: {
            //     0: "rgb(0,255,0)",
            //     1: "rgb(255,255,0)",
            //     2: "rgb(255,0,0)",
            //   },
            // },
          },
          fill: {
            value: 1,
            above: "rgba(255,0,0,0.1)", // Area will be red above the origin
            below: "rgba(0, 255, 0,0.1)",
          },
          label: "Last 365 days",
          data: dataSet365Day,
          borderColor: "rgb(0,228, 255)",
          pointBorderColor: "rgba(0, 0, 0, 1)", // This will be the border color of the points
          pointBackgroundColor: "rgba(75, 192, 192, 1)", // This will be the fill color of the points
        },
      ],
    };

    return dataset;
  }


}
