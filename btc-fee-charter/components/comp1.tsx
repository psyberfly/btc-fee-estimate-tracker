import React from 'react';
import { Line } from 'react-chartjs-2';
import { options } from './charts/chart_data';

const Comp1 = () => {
  return <h1>Hello from Comp1</h1>;
};

const ChartFeeIndex = (chartData) => {
  console.log(JSON.stringify(chartData))
  return <Line options={options} data={chartData} />;
};

export default ChartFeeIndex;
