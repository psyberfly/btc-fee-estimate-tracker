import React, { useEffect, useState, useRef } from 'react';
import './src/components/styles.css';
import logo from "/src/assets/images/logo.png";
import NavMenu from './src/components/nav_menu/nav_menu';
import { BrowserRouter, Route, Routes, Navigate } from 'react-router-dom';
import ChartPage from './src/components/chart/chart_page';
import ApiDocs from './src/components/api_docs/api_docs';
import './src/components/styles.css'; // Path to your main styles file
import { FaqPage } from './src/components/faq/faq_page';


const App = () => {
  return (
    <BrowserRouter>
      <div className="app-container">
        <div className="title-bar">
          <NavMenu />
          <img src={logo} alt="Logo" className="logo" />
          <h1>Bull Bitcoin Fee Multiple</h1>
          <p style={{ marginLeft: 'auto' }}>Updated every 10m</p>
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

