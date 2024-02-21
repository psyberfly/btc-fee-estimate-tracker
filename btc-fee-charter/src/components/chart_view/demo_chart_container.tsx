import React, { useRef, useState, useEffect } from 'react';
import Chart from 'chart.js/auto';
import { fetchChartDataFeeIndex } from '../../chart_data/chart_data';

const DemoChartContainer = () => {
    const chartContainer = useRef(null);
    const [selectedScale, setSelectedScale] = useState('hour');
    const [chartData, setChartData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [chartInstance, setChartInstance] = useState(null);

    useEffect(() => {
        const fetchData = async () => {
            try {
                setLoading(true); // Set loading to true when fetching data
                // Fetch chart data asynchronously
                const data = await fetchChartData();
                setChartData(data);
                setLoading(false); // Data fetched, set loading to false
                createOrUpdateChartInstance(data); // Create or update chart instance once data is fetched
            } catch (error) {
                console.error('Error fetching chart data:', error);
                setLoading(false); // Set loading to false in case of error
            }
        };

        fetchData();

        // Clean up chart instance on component unmount
        return () => {
            if (chartInstance) {
                chartInstance.destroy();
            }
        };
    }, []); // Empty dependency array to run only once when component mounts

    useEffect(() => {
        if (chartInstance) {
            // Update chart options when selected scale changes
            const updatedOptions = {
                scales: {
                    x: {
                        type: "time",
                        time: {
                            unit: selectedScale,
                        },
                        title: {
                            display: true,
                            text: "time",
                            color: titleColor,
                            font: { size: 14 },
                        },
                    },
                },
            };
            chartInstance.options = updatedOptions;
            chartInstance.update();
        }
    }, [selectedScale]);

    const createOrUpdateChartInstance = (data) => {
        if (chartInstance) {
            // If chart instance already exists, destroy it before creating a new one
            chartInstance.destroy();
        }

        if (chartContainer.current) {
            const newChartInstance = new Chart(chartContainer.current, {
                type: 'line',
                data: data,
                options: {
                    scales: {
                        x: {
                            type: "time",
                            time: {
                                unit: selectedScale,
                            },
                            title: {
                                display: true,
                                text: "time",
                                color: titleColor,
                                font: { size: 14 },
                            },
                        },
                        y: {
                            min: 0,
                            max: 2,
                            title: {
                                display: true,
                                text: "current fee est / moving average",
                                color: titleColor,
                                font: { size: 14 },
                            },
                        },
                    },
                    responsive: true,
                },
            });
            setChartInstance(newChartInstance);
        }
    };

    const handleScaleChange = (e) => {
        setSelectedScale(e.target.value);
    };

    return (
        <div style={{ width: '100%', height: '100vh', display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
            <div style={{ maxWidth: '90%', maxHeight: '90vh', width: '100%', height: '100%', position: 'relative' }}>
                <canvas ref={chartContainer} width="1800" height="1000" style={{ width: '100%', height: '100%' }}></canvas>
                <select value={selectedScale} onChange={handleScaleChange} style={{ position: 'absolute', top: 10, right: 10 }}>
                    <option value="hour">Hour</option>
                    <option value="day">Day</option>
                    <option value="month">Month</option>
                </select>
            </div>
        </div>
    );
    
    
    
};

// Example async function to fetch chart data
const fetchChartData = async () => {
    try {
        const data = await fetchChartDataFeeIndex();
        return data;
    }
    catch (e) {
        console.error(`Error fetching chart data! ${e}`);
        return e;
    }
};
const titleColor = "rgb(211, 211, 211)";
const subtitleColor = "rgb(190, 190, 190)";

export default DemoChartContainer;
