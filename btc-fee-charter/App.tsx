import React, { useEffect, useState } from 'react';
import './src/components/styles.css';
import ChartView from './src/components/chart_view/chart_view';
import { DataOp } from './src/chart_data/data_op';
import { ChartDatasetOp } from './src/chart_data/chart_dataset_op';
import { ServiceChartType } from './src/chart_data/interface';

const App = () => {
  const [allTimeData, setAllTimeData] = useState(null);
  const [chartType, setChartType] = useState(ServiceChartType.index);
  const [chartData, setChartData] = useState(null); // New state for chart data
  const dataOp = new DataOp();
  const chartDataOp = new ChartDatasetOp();

  useEffect(() => {
    const fetchDataAndSetDefaultChart = async () => {
      try {
        const data = await dataOp.fetchAllTime();
        if (data instanceof Error) {
          console.error(`Error fetching data.`)
          throw (data);
        }
        setAllTimeData(data);
        const defaultChartData = chartDataOp.getFromData(data, ServiceChartType.index);
        if(defaultChartData instanceof Error)
        {
          
        }
        setChartData(defaultChartData); // Set default chart data
      } catch (error) {
        console.error("Error fetching data:", error);
      }
    };

    fetchDataAndSetDefaultChart(); // Fetch data and set default chart on component mount
  }, []);

  // No changes needed in the rest of the component

  const handleClick = (selectedChartType) => {
    setChartType(selectedChartType);

    if (!allTimeData) {
      console.error("Data not available yet");
      return;
    }

    const chartData = chartDataOp.getFromData(allTimeData, selectedChartType);
    setChartData(chartData); // Set chartData state

    // To do: Update state or perform other actions based on chartData
  };

  return (
    <div>
      <div className="title-bar">
        <h1>BTC Fee Estimate Tracker</h1>
      </div>
      <div style={{ display: 'flex' }}>
        <div className="nav">
          <h2>Charts</h2>
          <button onClick={() => handleClick(ServiceChartType.index)}>{ServiceChartType.index}</button>
          <button onClick={() => handleClick(ServiceChartType.movingAverage)}>{ServiceChartType.movingAverage}</button>
          <button onClick={() => handleClick(ServiceChartType.feeEstimate)}>{ServiceChartType.feeEstimate}</button>
        </div>
        <ChartView dataset={chartData} chartType={chartType} /> {/* Pass chartData as a prop */}
      </div>
    </div>
  );
};

export default App;
