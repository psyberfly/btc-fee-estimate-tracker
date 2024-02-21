// ChartView.js

import React from 'react';

const ChartView = ({ renderChart, handleTimeRangeChange, TimerangeSelector, handleClick, chart1, chart2 }) => {
    return (
        <div className="view" style={{ padding: '30px 30px' }}>
            <div className="dropdown">
                {/* Dropdown code here */}
            </div>
            <TimerangeSelector options={["1 Hour", "1 Day", "1 Month"]} onChange={handleTimeRangeChange} />
            {renderChart()}

        </div>
    );
};

export default ChartView;
