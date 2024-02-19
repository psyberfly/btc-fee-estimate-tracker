
import React from 'react';
import { Line } from 'react-chartjs-2';
import { options, dataMovingAverageChart } from './App';

export function MovingAverageChartPage() {
  return <Line options={options} data={dataMovingAverageChart} />;
}
