import { FeeEstimate, FeeIndex, MovingAverage } from "../store/interface";
import { ChartType, IChartDatasetOp } from "./interface";

export class ChartDatasetOp implements IChartDatasetOp {
  getFromData<T extends FeeIndex[] | MovingAverage[] | FeeEstimate[]>(
    data: T,
    kind: ChartType,
  ): object | Error {
    try {
      switch (kind) {
        case ChartType.feeIndex:
       
          return this.getIndexDataset(
            data as unknown as FeeIndex[],
          );
        case ChartType.movingAverage:
          return this.getMovingAverageDataset(
            data as unknown as MovingAverage[],
          );
        case ChartType.feeEstimate:
     
          return this.getFeeEstimateDataset(data as unknown as FeeEstimate[]);
        default:
          throw new Error("This functionality is not yet implemented.");
      }
    } catch (e) {
      return e;
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

          label: "Fee Estimate",
          data: dataSet,
          borderColor: "rgb(0,228, 255)",
          pointBorderColor: "rgba(0, 0, 0, 1)",
          pointBackgroundColor: "rgb(0,228, 255)",
        },
      ],
    };

    return dataset;
  }

  private getMovingAverageDataset(data: MovingAverage[]) {
    const dataSet30Day: { x: Date; y: number }[] = [];
    const dataSet365Day: { x: Date; y: number }[] = [];

    data.forEach((element) => {
      dataSet30Day.push({
        x: element.time,
        y: element.last30Days,
      });
      dataSet365Day.push({
        x: element.time,
        y: element.last365Days,
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

  private getIndexDataset(data: FeeIndex[]) {
    const dataSet30Day: { x: Date; y: number }[] = [];
    const dataSet365Day: { x: Date; y: number }[] = [];

    data.forEach((element) => {
      dataSet30Day.push({
        x: element.time,
        y: element.ratioLast30Days,
      });
      dataSet365Day.push({
        x: element.time,
        y: element.ratioLast365Days,
      });
    });

    const dataset = {
      datasets: [
        {
          // fill: {
          //   value: 1,
          //   above: "rgba(255,0,0,0.1)", // Area will be red above the origin
          //   below: "rgba(0, 255, 0,0.1)",
          // },
          label: "Last 30 days",
          data: dataSet30Day,
          borderColor: "rgb(254, 112, 2)",
          pointBorderColor: "rgba(0, 0, 0, 1)",
          pointBackgroundColor: "rgb(254, 112, 2)",
        },
        {
          // fill: {
          //   value: 1,
          //   above: "rgba(255,0,0,0.1)", // Area will be red above the origin
          //   below: "rgba(0, 255, 0,0.1)",
          // },
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
