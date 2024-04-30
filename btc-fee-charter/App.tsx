import React, { useEffect, useState, useRef } from 'react';
import './src/assets/styles.css';
import logo from "/src/assets/images/logo.png";
import { BrowserRouter, Route, Routes, Navigate } from 'react-router-dom';
import './src/assets/styles.css'; // Path to your main styles file
// import ChartPage from './src/pages/home/chart_page';
import NavMenu from './src/components/nav_menu/nav_menu';
import FaqPage from './src/pages/faq/faq_page';
import ApiDocs from "./src/pages/api_docs/api_docs"
import FeeIndexChartPage from './src/pages/fee_index_chart/fee_index_chart_page';
import MovingAverageChartPage from './src/pages/moving_average_chart/moving_average_chart_page';
import { ONE_DAY_MS, ONE_MINUTE_MS } from './src/lib/time';
import FeeEstimateChartPage from './src/pages/fee_estimate_chart/fee_estimate_chart_page';
const App = () => {


  useEffect(() => {
    fetch('/version.json')
      .then(response => response.json())
      .then(data => {

        const currentVersion = localStorage.getItem('app_version');
        if (currentVersion !== data.version) {
          console.log("Outdated app version detected in browser cache. Refreshing webpage...");
          localStorage.setItem('app_version', data.version);
          window.location.reload(); // Soft reload; force reload deprecated. 
          if (currentVersion !== data.version) {
            console.log("Refresh failed to clear browser cache. Hard-refresh browser or clear browser cache.")
          }

        }
      }).catch(error => console.error('Error fetching version from host:', error));
  }, []);

  const [refreshTrigger1Day, setRefreshTrigger1Day] = useState(false);
  const [refreshTrigger1Minute, setRefreshTrigger1Minute] = useState(false);

  useEffect(() => {
    const intervalId1Minute = setInterval(() => {
      //  console.log("Triggering refresh: 1 minute");
      setRefreshTrigger1Minute(prev => !prev);
    }, ONE_MINUTE_MS);

    const intervalId1Day = setInterval(() => {
      // console.log("Triggering refresh: 1 day");
      setRefreshTrigger1Day(prev => !prev);
    }, ONE_DAY_MS);

    return () => {
      clearInterval(intervalId1Minute);
      clearInterval(intervalId1Day);
    }
  }, []);



  return (
    <BrowserRouter>
      <div className="app-container">
        <div className="title-bar" style={{ display: 'flex', alignItems: 'center' }}>
          <NavMenu versionNumber={localStorage.getItem('app_version')} />
          <img src={logo} alt="Logo" className="logo" />
          <h1 style={{ marginRight: 'auto', fontWeight: "normal" }}>Bull Bitcoin Fee Multiple</h1>
        </div>
        <Routes>
          <Route path="/" element={<Navigate to="/chart/index" replace />} />
          <Route path="/chart/index" element={<FeeIndexChartPage refreshTrigger={refreshTrigger1Minute} />} />
          <Route path="/chart/moving-average" element={<MovingAverageChartPage refreshTrigger={refreshTrigger1Day} />} />
          <Route path="/chart/fee-estimate" element={<FeeEstimateChartPage refreshTrigger={refreshTrigger1Minute} />} />
          <Route path="/api" element={<ApiDocs />} />
          <Route path="/faq" element={<FaqPage />} />
        </Routes>
      </div>
    </BrowserRouter>
  );
};

export default App;

