import React, { useEffect, useState } from 'react';
import './components/style.css';
// import Comp1 from './components/comp1';
// import ChartFeeIndex from './components/comp1';
import Comp2 from './components/comp2';
import { makeApiCall } from './lib/network/network';
import { ChartOp, } from './components/charts/chart_data';
import { IndexResponse } from './components/charts/interface';
import { Line } from 'react-chartjs-2';
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
  Filler
} from 'chart.js';
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler
);


const App = () => {

  const chart1 = "Fee Estimate Index"
  const chart2 = "Fee Estimate Moving Average"

  const [view, setView] = useState(chart1);
  const [haveData, setHaveData] = useState(false);
  const initDataSetFeeIndex: {
    datasets: {
      label: string;
      data: {
        x: Date;
        y: number;
      }[];
      borderColor: string;
      backgroundColor: string;
    }[];
  } = {
    datasets: []
  };

  const chartOptions = {
    responsive: true,
    plugins: {
      legend: {
        position: "top" as const,
      },
      interaction: {
        mode: 'index',
        intersect: false,
      },
      tooltip: {
        enabled: true,
        //  mode: 'index', // Display tooltips at nearest data point across lines
        intersect: false, // Display tooltips for all points, not just hovered ones
      },
      title: {
        display: true,
        text: "Current Fee Estimate : Fee Estimate Moving Average",
        font: {
          size: 18 // Set the desired font size here
        }
      },
      filler: {}
    },
  };

  const [chartDataFeeIndex, setChartData] = useState(initDataSetFeeIndex);

  //const chartOp = new ChartOp();
  useEffect(() => {
    console.log('Component mounted');

    const fetchData = async () => {
      try {
        const res = await makeApiCall("http://localhost:3561/service/indexHistory", "GET");

        if (res instanceof Error) {
          throw (res);
        }

        let feeIndexHistory: IndexResponse[] = [];

        res.forEach((element) => {
          const feeIndex: IndexResponse = {
            timestamp: element["timestamp"],
            feeEstimateMovingAverageRatio: {
              last365Days: element["feeEstimateMovingAverageRatio"]["last365Days"],
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

        const dataSet30Day: { x: Date, y: number }[] = [];
        const dataSet365Day: { x: Date, y: number }[] = [];

        feeIndexHistory.forEach((element) => {
          dataSet30Day.push({
            x: element.timestamp,
            y: element.feeEstimateMovingAverageRatio.last30Days,
          });
          dataSet365Day.push({
            x: element.timestamp,
            y: element.feeEstimateMovingAverageRatio.last365Days,
          });
        });

        const dataSetFeeIndex = {
          datasets: [
            {
              fill: {
                value: 1,
                above: 'rgb(220,20,60)',   // Area will be red above the origin
                below: 'rgb(128, 255, 0)'
              },
              label: "Last 30 days",
              data: dataSet30Day,
              borderColor: "rgb(50, 50, 50)",
              //backgroundColor: "rgba(255, 99, 132, 0.5)",
              borderWidth: 2,
            },
            {
              label: "Last 365 days",
              data: dataSet365Day,
              borderColor: "rgb(53, 162, 235)",
              // backgroundColor: "rgba(53, 162, 235, 0.5)",
              borderWidth: 2
            },
          ],
        };



        console.log({ dataSetFeeIndex });

        setChartData(dataSetFeeIndex);
        setHaveData(true);
      } catch (e) {
        console.error("Error fetching data:", e);
        setHaveData(false);
      }
    };

    fetchData();
  }, []);

  // const ChartFeeIndex = () => {
  //   //console.log(JSON.stringify(chartData))
  //   return <Line options={options} data={chartDataFeeIndex} />;
  // };

  const handleClick = (viewName) => {
    setView(viewName);
  };

  const renderChart = () => {
    switch (view) {
      case chart1:
        return <Line options={chartOptions} data={chartDataFeeIndex} />;
      case chart2:
        return <Comp2 />;
      // Add more cases for additional views
      default:
        return null; // Return null if the selected view is not defined
    }
  };
  return (
    <div>
      <div className="title-bar">
        <h1>BTC Fee Estimate Tracker</h1>
      </div>
      <div style={{ display: 'flex' }}>
        <div className="nav">
          <button onClick={() => handleClick(chart1)}>{chart1}</button>
          <button onClick={() => handleClick(chart2)}>{chart2}</button>
          {/* Add more buttons for additional views */}
        </div>
        {haveData ? (
          <div className="view">
            {renderChart()}
          </div>
        ) : (
          <div>Loading...</div>
        )}
      </div>
    </div>
  );
};

export default App;
