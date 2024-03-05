import React, { useEffect, useState, useRef } from 'react';
import './src/components/styles.css';
import ChartView from './src/components/chart_view/chart_view';
import { DataOp } from './src/chart_data/data_op';
import { ChartDatasetOp } from './src/chart_data/chart_dataset_op';
import { ServiceChartType } from './src/chart_data/interface';
import { ONE_MINUTE_MS, TEN_MINUTES_MS, TimeLib } from './src/lib/time';
import { Store } from './src/store/store';
import { ChartTimescale, TimeRange } from './src/chart_data/chart_timescale';
import logo from "./src/assets/images/logo.png";

//Extract functions out of useEffect and only invoke functions and setState from inside it. 

const App = () => {

  //-------------------------------NAV MENU-------------------------

  const [isNavOpen, setIsNavOpen] = useState(false);
  const navRef = useRef(null); // Ref for the nav element
  const hamburgerRef = useRef(null); // Add a ref for the hamburger menu
  // Custom hook or logic to close nav when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (isNavOpen && !(navRef as any).current.contains(event.target) && !(hamburgerRef as any).current.contains(event.target)) {
        setIsNavOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isNavOpen]);
  // Drag to close functionality
  useEffect(() => {
    const handleTouchStart = (e) => {
      const startX = e.touches[0].pageX;
      const handleTouchMove = (moveEvent) => {
        const moveX = moveEvent.touches[0].pageX;
        if (startX - moveX > 50) {
          setIsNavOpen(false);
          document.removeEventListener('touchmove', handleTouchMove);
        }
      };
      document.addEventListener('touchmove', handleTouchMove);

      const handleTouchEnd = () => {
        document.removeEventListener('touchmove', handleTouchMove);
        document.removeEventListener('touchend', handleTouchEnd);
      };
      document.addEventListener('touchend', handleTouchEnd);
    };

    if (isNavOpen && navRef.current) {
      (navRef.current as any).addEventListener('touchstart', handleTouchStart);
    }

    return () => {
      if (navRef.current) {
        (navRef.current as any).removeEventListener('touchstart', handleTouchStart);
      }
    };
  }, [isNavOpen]);


  //-------------------------------CHART DATA -------------------------


  const [chartData, setChartData] = useState(null);
  const [chartType, setChartType] = useState(ServiceChartType.index);
  const [loading, setLoading] = useState({ [ServiceChartType.index]: true });
  const [errorLoading, setErrorLoading] = useState({ [ServiceChartType.index]: false });
  const [lastUpdated, setLastUpdated] = useState(null);
  const dataOp = new DataOp();
  const chartDataOp = new ChartDatasetOp();
  const store = new Store();
  const [selectedRange, setSelectedRange] = useState(TimeRange.Last1Month); // Default 
  useEffect(() => {
    const fetchDataForChartType = async (chartType) => {
      try {
        setLoading(prev => ({ ...prev, [chartType]: true }));
        let data;

        //first read latest timestamp from DB
        const availableHistoryStartTimestamp = new Date(await store.historyStartTimestamp(chartType));
        const [requiredHistoryStart, requiredHistoryEnd] = ChartTimescale.getStartEndTimestampsFromTimerange(selectedRange);
        const requiredHistoryStartTimestamp = new Date(requiredHistoryStart);

        if (!availableHistoryStartTimestamp || availableHistoryStartTimestamp > requiredHistoryStartTimestamp) {
          //fetch the latest readings from watcher beyond latest timestamp
          switch (chartType) {
            case ServiceChartType.index:
              data = await dataOp.fetchFeeIndexHistory(requiredHistoryStartTimestamp);
              break;
            case ServiceChartType.movingAverage:
              data = await dataOp.fetchMovingAverageHistory(requiredHistoryStartTimestamp);
              break;
            case ServiceChartType.feeEstimate:
              data = await dataOp.fetchFeeEstimateHistory(requiredHistoryStartTimestamp);
              break;
            default:
              throw new Error('Invalid chart type');
          }

          if (data instanceof Error) {
            console.error(`Error fetching data for ${chartType}`);
            throw data;
          }

          const isDataStored = await store.upsert(chartType, data);

          if (isDataStored instanceof Error) {
            throw new Error(`Error storing data to DB: ${isDataStored}`);
          }

        }
        const history = await store.read(chartType); //this could be upgraded to fetch data from db by selectedRange?
        const chartData = chartDataOp.getFromData(history, chartType);
        if (chartData instanceof Error) {
          console.error(`Error getting chart dataset from data.`);
          throw chartData;
        }

        setChartData(chartData as any);
        updateLastUpdated(new Date());
      } catch (error) {
        console.error("Error setting data:", error);
        setErrorLoading(prev => ({ ...prev, [chartType]: true }));
      } finally {
        setLoading(prev => ({ ...prev, [chartType]: false }));
      }
    };


    const updateDataHistory = async (chartType) => {
      const availableHistoryEndTimestamp = new Date(await store.historyEndTimestamp(chartType));
      let data;
      switch (chartType) {
        case ServiceChartType.index:
          data = await dataOp.fetchFeeIndexHistory(availableHistoryEndTimestamp);
          break;
        case ServiceChartType.movingAverage:
          data = await dataOp.fetchMovingAverageHistory(availableHistoryEndTimestamp);
          break;
        case ServiceChartType.feeEstimate:
          data = await dataOp.fetchFeeEstimateHistory(availableHistoryEndTimestamp);
          break;
        default:
          throw new Error('Invalid chart type');
      }

      if (data instanceof Error) {
        console.error(`Update data history: Error fetching data for ${chartType}`);
        throw data;
      }

      const isDataStored = await store.upsert(chartType, data);

      if (isDataStored instanceof Error) {
        throw new Error(`Update data history: Error storing data to DB: ${isDataStored}`);
      }
    }

    fetchDataForChartType(chartType);

    setInterval(() => {
      console.log("Updating history...")
      updateDataHistory(chartType);
      fetchDataForChartType(chartType);
    }, TEN_MINUTES_MS);

  }, [chartType, selectedRange]);


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
        <button ref={hamburgerRef} className="hamburger" onClick={() => setIsNavOpen(!isNavOpen)}>
          <div /><div /><div />
        </button>
        <img src={logo} alt="Logo" className="logo" />
        <h1>BTC Fee Estimate Tracker</h1>
        {lastUpdated && (
          <h3 style={{ marginLeft: 'auto' }}>Last updated: {(lastUpdated as any).toLocaleString()}</h3>
        )}
      </div>
      <div style={{ display: 'flex' }}>
        <div ref={navRef} className={`nav ${isNavOpen ? 'nav-open' : ''}`}>
          <h2>Charts</h2>
          <button onClick={() => handleClick(ServiceChartType.index)}>Index</button>
          <button onClick={() => handleClick(ServiceChartType.movingAverage)}>Moving Average</button>
          <button onClick={() => handleClick(ServiceChartType.feeEstimate)}>Fee Estimate</button>
        </div>
        {errorLoading[chartType] ? (
          <div className="banner-error">Error loading data. Please try again later.</div>
        ) : loading[chartType] ? (
          <div className="banner-loading">Loading...</div>
        ) : (
          <ChartView dataset={chartData} chartType={chartType} selectedRange={selectedRange} setSelectedRange={setSelectedRange} />
        )}
      </div>
    </div>
  );
};


export default App;
