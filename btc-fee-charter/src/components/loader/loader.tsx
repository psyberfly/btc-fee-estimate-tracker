import React from 'react';
import './loader.css'; // Make sure to create this CSS file

const CircularProgressIndicator = () => {
  return (
    <div className="progress-container">
      <div className="circular-loader"></div>
    </div>
  );
};

export default CircularProgressIndicator;
