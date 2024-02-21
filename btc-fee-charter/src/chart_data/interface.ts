export interface IndexResponse {
  timestamp: Date;
  feeEstimateMovingAverageRatio: {
    last365Days: number;
    last30Days: number;
  };
  currentFeeEstimate: {
    satsPerByte: number;
  };
  movingAverage: {
    createdAt: Date;
    last365Days: number;
    last30Days: number;
  };
}

// export interface ChartData {
//   datasets: {
//     label: string;
//     data: { x: Date; y: number }[]; // Here you might want to replace `{}` with a specific type for your data
//     borderColor: string;
//     backgroundColor: string;
//   }[];
// }
