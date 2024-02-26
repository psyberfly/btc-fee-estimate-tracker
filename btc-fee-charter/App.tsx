import React, { useEffect, useState } from 'react';
import './src/components/styles.css';
import ChartView from './src/components/chart_view/chart_view';
import { DataOp } from './src/chart_data/data_op';
import { ChartDatasetOp } from './src/chart_data/chart_dataset_op';
import { ServiceChartType } from './src/chart_data/interface';

const App = () => {
  const [indexHistoryData, setIndexHistoryData] = useState(null);
  const [feeEstimateHistoryData, setFeeEstimateHistoryData] = useState(null);
  const [chartType, setChartType] = useState(ServiceChartType.index);
  const [chartData, setChartData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [errorLoading, setErrorLoading] = useState(false);

  const [lastUpdated, setLastUpdated] = useState(null); // State for last refreshed time
  const dataOp = new DataOp();
  const chartDataOp = new ChartDatasetOp();

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        //this could be changed to WS instead of API?
        const indexData = await dataOp.fetchIndexHistory();

        if (indexData instanceof Error) {
          console.error(`Error fetching index data.`);
          throw indexData;
        }

        const feeEstimateData = await dataOp.fetchFeeEstimateHistory();

        if (feeEstimateData instanceof Error) {
          console.error(`Error fetching fee estimate data`);
          throw feeEstimateData;
        }

        setIndexHistoryData(indexData.data);
        setFeeEstimateHistoryData(feeEstimateData);

        const defaultChartData = chartDataOp.getFromData(indexData.data, ServiceChartType.index);
        if (defaultChartData instanceof Error) {
          console.error(`Error getting chart dataset from data.`);
          throw defaultChartData;
        }
        setChartData(defaultChartData);
        setLoading(false);
        setErrorLoading(false);
        updateLastUpdated(new Date(indexData.lastUpdated));
      } catch (error) {
        console.error("Error setting data:", error);
        setLoading(false);
        setErrorLoading(true);
      }
    };

    fetchData();

    const interval = setInterval(fetchData, 10 * 60 * 1000);

    return () => clearInterval(interval);
  }, []);

  const updateLastUpdated = (lastUpdated) => {
    setLastUpdated(lastUpdated); // Update last refreshed time with current Date object
  };

  const handleClick = (selectedChartType) => {
    setChartType(selectedChartType);
    let chartData;

    switch (selectedChartType) {
      case ServiceChartType.index:
      case ServiceChartType.movingAverage:
        if (!indexHistoryData) {
          console.error("Data not available yet");
          return;
        }

        chartData = chartDataOp.getFromData(indexHistoryData, selectedChartType);
        setChartData(chartData);
        break;
      case ServiceChartType.feeEstimate:
        if (!feeEstimateHistoryData) {
          console.error("Data not available yet");
          return;
        }
        chartData = chartDataOp.getFromData(feeEstimateHistoryData, selectedChartType);
        setChartData(chartData);
        break;
    }
  };

  return (
    <div>
      <div className="title-bar">
        <h1>BTC Fee Estimate Tracker</h1>
        {lastUpdated && (
          <span style={{ marginLeft: 'auto' }}>Last updated: {lastUpdated.toLocaleString()}</span>
        )}
      </div>
      <div style={{ display: 'flex' }}>
        <div className="nav">
          <h2>Charts</h2>
          <button onClick={() => handleClick(ServiceChartType.index)}>{ServiceChartType.index}</button>
          <button onClick={() => handleClick(ServiceChartType.movingAverage)}>{ServiceChartType.movingAverage}</button>
          <button onClick={() => handleClick(ServiceChartType.feeEstimate)}>{ServiceChartType.feeEstimate}</button>
        </div>
        {errorLoading ? (
          <div className="banner-error">Error loading data. Please try again later.</div>
        ) : loading ? (
          <div className="banner-loading">Loading...</div>
        ) : (
          <ChartView dataset={chartData} chartType={chartType} />
        )}
      </div>
    </div>
  );
};

export default App;
