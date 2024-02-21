import React, { useEffect, useState, useRef } from 'react';
import { Line } from 'react-chartjs-2';
import TimeUnitSelector from '../dropdown/dropdown';
import { getChartOptions, fetchChartDataFeeIndex } from '../../chart_data/chart_data';
//import { chartOptions } from '../charts/chart_data';

const ChartView2 = () => {
    const chart1 = "Fee Estimate Index";
    const chart2 = "Fee Estimate Moving Average";
    const timeUnitOptions = ["hour", "day", "month"];

    const [view, setView] = useState(chart1);
    const [haveData, setHaveData] = useState(false);
    const [chartDataFeeIndex, setChartData] = useState(null);

    // const chartRef = useRef(null);

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

    const titleColor = "rgb(211, 211, 211)";
    const subtitleColor = "rgb(190, 190, 190)";

    const defaultChartOptions = {
        scales: {
            x: {
                type: "time" as const,
                time: {
                    unit: "hour",
                },
                title: {
                    display: true,
                    text: "time" as const,
                    color: titleColor,
                    font: { size: 14 },
                },
            },
            y: {
                min: 0,
                max: 2,
                title: {
                    display: true,
                    text: "current fee est / moving average" as const,
                    color: titleColor,
                    font: { size: 14 },
                },
            },
        },
        responsive: true,
        plugins: {
            legend: {
                align: "start" as const,
                position: "bottom" as const,
                fill: true,
                labels: {
                    pointStyleWidth: 40,
                    usePointStyle: true,
                    pointStyle: "rectRounded" as const,
                },
            },
            interaction: {
                mode: "index" as const,
                intersect: false,
            },
            tooltip: {
                enabled: true,
                intersect: false,
            },
            title: {
                display: true,
                position: "top" as const,
                align: "start" as const,
                padding: { top: 0, bottom: 10 },
                text: "Fee Estimate Index" as const,
                color: titleColor,
                font: {
                    family: "'Courier New', monospace" as const,
                    size: 20,
                },
            },
            subtitle: {
                display: true,
                position: "top" as const,
                align: "start" as const,
                padding: { top: 0, bottom: 30 },
                text: "current fee estimate / fee estimate moving average" as const,
                color: subtitleColor,
                font: {
                    family: "'Courier New', monospace" as const,
                    size: 14,
                },
            },
            verticalLine: {
                lineWidth: 1.5,
                lineColor: "rgba(255, 0, 0, 0.75)" as const,
            },
            annotation: {
                annotations: {
                    line1: {
                        type: "line" as const,
                        yMin: 1,
                        yMax: 1,
                        borderColor: subtitleColor,
                        borderWidth: 1,
                    },
                },
            },
            filler: {},
            gradient: {},
        },
    };

    const [chartOptions, setChartOptions] = useState(defaultChartOptions);


    const handleTimeUnitChange = (selectedTimeUnit) => {

        const newChartOptions = {
            scales: {
                x: {
                    type: "time" as const,
                    time: {
                        unit: selectedTimeUnit,
                    },
                    title: {
                        display: true,
                        text: "time" as const,
                        color: titleColor,
                        font: { size: 14 },
                    },
                },
                y: {
                    min: 0,
                    max: 2,
                    title: {
                        display: true,
                        text: "current fee est / moving average" as const,
                        color: titleColor,
                        font: { size: 14 },
                    },
                },
            },
            responsive: true,
            plugins: {
                legend: {
                    align: "start" as const,
                    position: "bottom" as const,
                    fill: true,
                    labels: {
                        pointStyleWidth: 40,
                        usePointStyle: true,
                        pointStyle: "rectRounded" as const,
                    },
                },
                interaction: {
                    mode: "index" as const,
                    intersect: false,
                },
                tooltip: {
                    enabled: true,
                    intersect: false,
                },
                title: {
                    display: true,
                    position: "top" as const,
                    align: "start" as const,
                    padding: { top: 0, bottom: 10 },
                    text: "Fee Estimate Index" as const,
                    color: titleColor,
                    font: {
                        family: "'Courier New', monospace" as const,
                        size: 20,
                    },
                },
                subtitle: {
                    display: true,
                    position: "top" as const,
                    align: "start" as const,
                    padding: { top: 0, bottom: 30 },
                    text: "current fee estimate / fee estimate moving average" as const,
                    color: subtitleColor,
                    font: {
                        family: "'Courier New', monospace" as const,
                        size: 14,
                    },
                },
                verticalLine: {
                    lineWidth: 1.5,
                    lineColor: "rgba(255, 0, 0, 0.75)" as const,
                },
                annotation: {
                    annotations: {
                        line1: {
                            type: "line" as const,
                            yMin: 1,
                            yMax: 1,
                            borderColor: subtitleColor,
                            borderWidth: 1,
                        },
                    },
                },
                filler: {},
                gradient: {},
            },
        };

        setChartOptions(newChartOptions);
    }
    return (
        <div className="view" style={{ padding: '30px 30px' }}>
            <div className="dropdown">
                {/* Dropdown code here */}
            </div>
            <TimeUnitSelector options={timeUnitOptions} onChange={handleTimeUnitChange} />

            {haveData ? (
                <Line options={chartOptions} data={chartDataFeeIndex} />
            ) : (
                <div>Loading...</div>
            )}
        </div>
    );


};



export default ChartView2;