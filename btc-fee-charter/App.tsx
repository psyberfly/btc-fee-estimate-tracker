import React, { useEffect, useState } from 'react';
import './src/components/styles.css';
import ChartView from './src/components/chart_view/chart_view';
import { DataOp } from './src/chart_data/data_op';
import { ChartDatasetOp } from './src/chart_data/chart_dataset_op';
import { ServiceChartType } from './src/chart_data/interface';

const App = () => {
  const [allTimeData, setAllTimeData] = useState(null);
  const [chartType, setChartType] = useState(ServiceChartType.index);
  const [chartData, setChartData] = useState(null);
  const [loading, setLoading] = useState(true); // State to track loading status
  const dataOp = new DataOp();
  const chartDataOp = new ChartDatasetOp();

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true); // Set loading to true while fetching data
        const data = await dataOp.fetchAllTime();
        if (data instanceof Error) {
          console.error(`Error fetching data.`);
          throw data;
        }
        setAllTimeData(data);
        const defaultChartData = chartDataOp.getFromData(data, ServiceChartType.index);
        if (defaultChartData instanceof Error) {
          console.error(`Error getting default chart data.`);
          throw defaultChartData;
        }
        setChartData(defaultChartData);
        setLoading(false); // Set loading to false after data is fetched
      } catch (error) {
        console.error("Error fetching data:", error);
        setLoading(false); // Set loading to false in case of error
      }
    };

    fetchData(); // Fetch data on component mount

    const interval = setInterval(fetchData, 10 * 60 * 1000); // Fetch data every 10 minutes

    return () => clearInterval(interval); // Clean up interval on component unmount
  }, []);

  const handleClick = (selectedChartType) => {
    setChartType(selectedChartType);

    if (!allTimeData) {
      console.error("Data not available yet");
      return;
    }

    const chartData = chartDataOp.getFromData(allTimeData, selectedChartType);
    setChartData(chartData);
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
        {loading ? (
          <div>Loading...</div>
        ) : (
          <ChartView dataset={chartData} chartType={chartType} />
        )}
      </div>
    </div>
  );
};

export default App;
