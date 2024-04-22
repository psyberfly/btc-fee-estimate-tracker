import React, { useEffect, useState, useRef } from 'react';
import './src/assets/styles.css';
import logo from "/src/assets/images/logo.png";
import { BrowserRouter, Route, Routes, Navigate } from 'react-router-dom';
import './src/assets/styles.css'; // Path to your main styles file
import ChartPage from './src/pages/home/chart_page';
import NavMenu from './src/pages/home/components/nav_menu/nav_menu';
import FaqPage from './src/pages/faq/faq_page';
import ApiDocs from "./src/pages/api_docs/api_docs"
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
          <Route path="/chart/:chartType" element={<ChartPage />} />
          <Route path="/api" element={<ApiDocs />} />
          <Route path="/faq" element={<FaqPage />} />
        </Routes>
      </div>
    </BrowserRouter>
  );
};

export default App;

