
import React from 'react';
import { Line } from 'react-chartjs-2';
import { options, } from './chart_data';

export function ChartMovingAverage() {
  return <Line options={options} data={dataMovingAverageChart} />;
}
