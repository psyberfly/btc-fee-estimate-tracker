// import React from 'react';
// import {
//   Chart as ChartJS,
//   CategoryScale,
//   LinearScale,
//   PointElement,
//   LineElement,
//   Title,
//   Tooltip,
//   Legend,
//   elements,
// } from 'chart.js';
// import { makeApiCall } from './lib/network/network';
// import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
// import { FeeIndexChartPage } from './charts/fee_index_chart';
// import { MovingAverageChartPage } from './charts/moving_avg_chart';
// import { ChartOp } from './src/chart/chart';

// ChartJS.register(
//   CategoryScale,
//   LinearScale,
//   PointElement,
//   LineElement,
//   Title,
//   Tooltip,
//   Legend
// );

// const chartOp = new ChartOp();


// const res = await makeApiCall("http://localhost:3561/service/indexHistory", "GET");
// if (res instanceof Error) {
//   throw (res);
// }


// const data = chartOp.parseApiData(res);
// if (data instanceof Error) {
//   throw data;
// }

// export const feeIndexChartData = chartOp.getChartDataFeeIndex(data);
// if (feeIndexChartData instanceof Error) {
//   throw feeIndexChartData;
// }

// export const movingAverageChartData = chartOp.getChartDataMovingAverage(data);
// if (movingAverageChartData instanceof Error) {
//   throw movingAverageChartData;
// }

// // @ts-ignore
// const servicePath = import.meta.env.VITE_SERVER_PATH;

// export function App() {
//   return (
//     <Router>
//       <Routes>
//         <Route path="/" element={<div>Hello from BTC Fee Charter!</div>} />
//         <Route path={`${servicePath}/feeIndex`} element={FeeIndexChartPage()} />
//         <Route path={`${servicePath}/movingAverage`} element={MovingAverageChartPage()} />
//       </Routes>
//     </Router>
//   );
// }

