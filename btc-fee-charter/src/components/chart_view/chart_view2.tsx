import React, { useEffect, useState } from 'react';
import { Line } from 'react-chartjs-2';
import TimerangeSelector from '../dropdown/dropdown';
import { chartOptions, fetchChartDataFeeIndex } from '../../chart_data/chart_data';

const ChartView2 = () => {


    const chart1 = "Fee Estimate Index"
    const chart2 = "Fee Estimate Moving Average"
    const timeRangeOptions = ["1 Hour", "1 Day", "1 Month"]

    const [view, setView] = useState(chart1);
    const [haveData, setHaveData] = useState(false);

    const [chartDataFeeIndex, setChartData] = useState(null);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const datasetFeeIndex = await fetchChartDataFeeIndex();
                setChartData(datasetFeeIndex);
                setHaveData(true);
            } catch (e) {
                console.error("Error fetching data:", e);
                setHaveData(false);
            }
        };

        fetchData();
    }, []);

    const handleClick = (viewName) => {
        setView(viewName);
    };

    const handleTimeRangeChange = (viewName) => {
        //setView(viewName);
    };


    const renderChart = () => {
        switch (view) {
            case chart1:
                return <Line options={chartOptions} data={chartDataFeeIndex} />;
            case chart2:
                return "Unmapped option";
            // Add more cases for additional views
            default:
                return null; // Return null if the selected view is not defined
        }
    };


    return (
        <div className="view" style={{ padding: '30px 30px' }}>
            <div className="dropdown">
                {/* Dropdown code here */}
            </div>
            <TimerangeSelector options={timeRangeOptions} onChange={handleTimeRangeChange} />

            {haveData ? (
                renderChart()
            ) : (
                <div>Loading...</div>
            )}
        </div>
    );
};

export default ChartView2;
