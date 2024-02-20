// ChartPage1.js

import React from 'react';
import { Line } from 'react-chartjs-2';
import { options, dataFeeIndexChart } from '../App';

export function FeeIndexChartPage() {
  return <Line options={options} data={dataFeeIndexChart} />;
}
