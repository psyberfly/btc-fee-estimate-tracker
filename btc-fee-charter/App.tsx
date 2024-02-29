import React, { useEffect, useState } from 'react';
import './src/components/styles.css';
import ChartView from './src/components/chart_view/chart_view';
import { DataOp } from './src/chart_data/data_op';
import { ChartDatasetOp } from './src/chart_data/chart_dataset_op';
import { ServiceChartType } from './src/chart_data/interface';
// import Dexie from 'dexie';

// const db = new Dexie('ChartDataDB');
// db.version(1).stores({
//   chartData: 'type,lastUpdated,data',
// });

const App = () => {
  const [chartData, setChartData] = useState(null);
  const [chartType, setChartType] = useState(ServiceChartType.index);
  const [loading, setLoading] = useState({ [ServiceChartType.index]: true });
  const [errorLoading, setErrorLoading] = useState({ [ServiceChartType.index]: false });
  const [lastUpdated, setLastUpdated] = useState(null);
  const [isNavOpen, setIsNavOpen] = useState(false);


  const dataOp = new DataOp();
  const chartDataOp = new ChartDatasetOp();

  useEffect(() => {
    const fetchDataForChartType = async (chartType) => {
      try {
        setLoading(prev => ({ ...prev, [chartType]: true }));
        let data;

        switch (chartType) {
          case ServiceChartType.index:
            data = await dataOp.fetchFeeIndexHistory();
            break;
          case ServiceChartType.movingAverage:
            data = await dataOp.fetchMovingAverageHistory();
            break;
          case ServiceChartType.feeEstimate:
            data = await dataOp.fetchFeeEstimateHistory();
            break;
          default:
            throw new Error('Invalid chart type');
        }

        if (data instanceof Error) {
          console.error(`Error fetching data for ${chartType}`);
          throw data;
        }

        const chartData = chartDataOp.getFromData(data, chartType);
        if (chartData instanceof Error) {
          console.error(`Error getting chart dataset from data.`);
          throw chartData;
        }

        setChartData(chartData);
        updateLastUpdated(new Date());
      } catch (error) {
        console.error("Error setting data:", error);
        setErrorLoading(prev => ({ ...prev, [chartType]: true }));
      } finally {
        setLoading(prev => ({ ...prev, [chartType]: false }));
      }
    };

    fetchDataForChartType(chartType);

  }, [chartType]);

  const updateLastUpdated = (lastUpdated) => {
    setLastUpdated(lastUpdated);
  };


  const handleClick = (selectedChartType) => {
    setChartType(selectedChartType);
    setIsNavOpen(false); // Close the nav menu when a chart type is selected
  };


  return (
    <div>
  <div className="title-bar">
    <button className="hamburger" onClick={() => setIsNavOpen(!isNavOpen)}>
      <div /><div /><div />
    </button>
    <h1>BTC Fee Estimate Tracker</h1>
    {lastUpdated && (
      <h2 style={{ marginLeft: 'auto' }}>Last updated: {lastUpdated.toLocaleString()}</h2>
    )}
  </div>
  <div style={{ display: 'flex' }}>
    <div className={`nav ${isNavOpen ? 'nav-open' : ''}`}>
      <h2>Charts</h2> {/* This heading should be part of the nav content to move with the menu */}
      <button onClick={() => handleClick(ServiceChartType.index)}>Index</button>
      <button onClick={() => handleClick(ServiceChartType.movingAverage)}>Moving Average</button>
      <button onClick={() => handleClick(ServiceChartType.feeEstimate)}>Fee Estimate</button>
    </div>
    {errorLoading[chartType] ? (
      <div className="banner-error">Error loading data. Please try again later.</div>
    ) : loading[chartType] ? (
      <div className="banner-loading">Loading...</div>
    ) : (
      <ChartView dataset={chartData} chartType={chartType} />
    )}
  </div>
</div>

  );
};

export default App;
