import React, { useEffect, useState } from 'react';
import './src/components/styles.css';
import { chartOptions, fetchChartDataFeeIndex } from "./src/chart_data/chart_data";
import { Line } from 'react-chartjs-2';
import TimerangeSelector from './src/components/dropdown/dropdown';
import ChartView from "./src/components/chart_view/chart_view";

const App = () => {

  const chart1 = "Fee Estimate Index"
  const chart2 = "Fee Estimate Moving Average"

  const [view, setView] = useState(chart1);
  const [haveData, setHaveData] = useState(false);

  const [chartDataFeeIndex, setChartData] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const datasetFeeIndex = await fetchChartDataFeeIndex();
        setChartData(datasetFeeIndex);
        setHaveData(true);
      } catch (e) {
        console.error("Error fetching data:", e);
        setHaveData(false);
      }
    };

    fetchData();
  }, []);

  const handleClick = (viewName) => {
    setView(viewName);
  };

  const handleTimeRangeChange = (viewName) => {
    //setView(viewName);
  };


  const renderChart = () => {
    switch (view) {
      case chart1:
        return <Line options={chartOptions} data={chartDataFeeIndex} />;
      case chart2:
        return "Unmapped option";
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
          <h2>Charts</h2>
          <button onClick={() => handleClick(chart1)}>{chart1}</button>
          <button onClick={() => handleClick(chart2)}>{chart2}</button>
          {/* Add more buttons for additional views */}
        </div>
        {haveData ? (
          <ChartView
            
            renderChart={renderChart}
            handleTimeRangeChange={handleTimeRangeChange}
            TimerangeSelector={TimerangeSelector}
            handleClick={handleClick}
            chart1={chart1}
            chart2={chart2}
          />
        ) : (
          <div>Loading...</div>
        )}
      </div>
    </div>
  );
};
export default App;
