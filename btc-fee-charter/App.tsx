import React, { useEffect, useState, useRef } from 'react';
import './src/components/styles.css';
import logo from "/src/assets/images/logo.png";
import NavMenu from './src/components/nav_menu/nav_menu';
import { BrowserRouter, Route, Routes, Navigate } from 'react-router-dom';
import ChartPage from './src/components/chart/chart_page';
import ApiDocs from './src/components/api_docs/api_docs';


const App = () => {
  return (
    <BrowserRouter>
      <div className="app-container">
        <div className="title-bar">
          <NavMenu />
          <img src={logo} alt="Logo" className="logo" />
          <h1>BTC Fee Estimate Tracker</h1>
          <h4 style={{ marginLeft: 'auto' }}>Updated every 10m</h4>
        </div>
        <Routes>
        <Route path="/" element={<Navigate to="/chart/index" replace />} />
          <Route path="/chart/:chartType" element={<ChartPage />} />
          <Route path="/api" element={<ApiDocs />} />
          {/* Define other routes here */}
        </Routes>
      </div>
    </BrowserRouter>
  );
};
export default App;

