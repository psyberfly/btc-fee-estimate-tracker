import React from 'react';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  elements,
} from 'chart.js';
import { makeApiCall } from './lib/network/network';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import { FeeIndexChartPage } from './fee_index_chart';
import { MovingAverageChartPage } from './moving_avg_chart';


ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
);

export const options = {
  responsive: true,
  plugins: {
    legend: {
      position: 'top' as const,
    },
    title: {
      display: true,
      text: 'BTC Fee Index',
    },
  },
};

interface IndexResponse {
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


const res = await makeApiCall("http://localhost:3561/service/indexHistory", "GET");

if (res instanceof Error) {
  throw (res);
}

let feeIndexHistory: IndexResponse[] = [];

res.forEach(element => {
  const feeIndex: IndexResponse = {
    timestamp: element["timestamp"],
    feeEstimateMovingAverageRatio: {
      last365Days: element["feeEstimateMovingAverageRatio"]["last365Days"],
      last30Days: element["feeEstimateMovingAverageRatio"]["last30Days"],
    },
    currentFeeEstimate: {
      satsPerByte: element["currentFeeEstimate"]["satsPerByte"]
    },
    movingAverage: {
      createdAt: element["movingAverage"]["createdAt"],
      last365Days: element["movingAverage"]["last365Days"],
      last30Days: element["movingAverage"]["last30Days"],
    }
  }

  feeIndexHistory.push(feeIndex);
});

const dataSet30Day: {}[] = [];
const dataSet365Day: {}[] = [];
const dataSetMovingAvg30Day: {}[] = [];
const dataSetMovingAvg365Day: {}[] = [];


feeIndexHistory.forEach(element => {

  dataSet30Day.push({ "x": element.timestamp, "y": element.feeEstimateMovingAverageRatio.last30Days });
  dataSet365Day.push({ "x": element.timestamp, "y": element.feeEstimateMovingAverageRatio.last365Days });

  dataSetMovingAvg30Day.push({ "x": element.movingAverage.createdAt, "y": element.feeEstimateMovingAverageRatio.last30Days });
  dataSetMovingAvg365Day.push({ "x": element.movingAverage.createdAt, "y": element.feeEstimateMovingAverageRatio.last365Days });

});




//const labelsMovingAverage = feeIndexHistory.map(element => element.movingAverage.last30Days)

export const dataFeeIndexChart = {
  // labels: labels30Day,
  datasets: [
    {
      label: 'Current Fee Estimate : Moving Average last 30 days',
      data: dataSet30Day,
      borderColor: 'rgb(255, 99, 132)',
      backgroundColor: 'rgba(255, 99, 132, 0.5)',
    },
    {
      label: 'Current Fee Estimate : Moving Average last 365 days',
      data: dataSet365Day,
      borderColor: 'rgb(53, 162, 235)',
      backgroundColor: 'rgba(53, 162, 235, 0.5)',
    },

  ],

};

export const dataMovingAverageChart = {
  // labels: labels30Day,
  datasets: [
    {
      label: 'Fee Estimate Moving Average last 30 days',
      data: dataSetMovingAvg30Day,
      borderColor: 'rgb(255, 99, 132)',
      backgroundColor: 'rgba(255, 99, 132, 0.5)',
    },
    {
      label: 'Fee Estimate Moving Average last 365 days',
      data: dataSetMovingAvg365Day,
      borderColor: 'rgb(53, 162, 235)',
      backgroundColor: 'rgba(53, 162, 235, 0.5)',
    },

  ]
};

// @ts-ignore
const servicePath = import.meta.env.VITE_SERVER_PATH;

export function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<div>Hello from BTC Fee Charter!</div>} />
        <Route path={`${servicePath}/feeIndex`} element={FeeIndexChartPage()} />
        <Route path={`${servicePath}/movingAverage`} element={MovingAverageChartPage()} />
      </Routes>
    </Router>
  );
}


// export function App() {
//   return <Line options={options} data={data} />;
// }
