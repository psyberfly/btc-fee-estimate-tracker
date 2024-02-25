import React, { useRef, useState, useEffect } from 'react';
import Chart, { ChartOptions } from 'chart.js/auto';
import "chartjs-adapter-date-fns";
import gradient from "chartjs-plugin-gradient";
Chart.register(gradient);
import annotationPlugin from "chartjs-plugin-annotation";
import { ServiceChartType } from '../../chart_data/interface';
Chart.register(annotationPlugin);

Chart.defaults.elements.point.pointStyle = false;
Chart.defaults.elements.point.radius = 0;
Chart.defaults.elements.line.borderWidth = 1.5;
Chart.defaults.elements.line.tension = 0;
Chart.defaults.scales.time.adapters.date = { "timezone": "UTC" };
// Chart.defaults.backgroundColor = "rgba(0,255,0,0.2)";
Chart.defaults.scale.ticks.color = "rgb(255,255,255)";
Chart.defaults.scale.grid.color = "rgba(199, 199, 199, 0.2)";
const titleColor = "rgb(211, 211, 211)";
const secondaryColor = "rgb(190, 190, 190)";

const verticalLinePlugin = {
    id: "verticalLine",
    afterDraw(chart, args, options) {
        const { ctx, tooltip } = chart;
        if (tooltip._active && tooltip._active.length) {
            const activePoint = tooltip._active[0];
            const x = activePoint.element.x;
            const topY = chart.scales.y.top;
            const bottomY = chart.scales.y.bottom;

            // Draw the vertical line
            ctx.save();
            ctx.beginPath();
            ctx.moveTo(x, topY);
            ctx.lineTo(x, bottomY);
            ctx.lineWidth = options.lineWidth || 1;
            ctx.strokeStyle = options.lineColor || "#000";
            ctx.stroke();
            ctx.restore();
        }
    },
};

Chart.register(verticalLinePlugin);


//This is of type ChartOptions<"line"> but TS compiler confuses Types with this lib.
//INDEX CHART:
const defaultChartOptions = (chartType: ServiceChartType, yMaxInDataset: number, selectedRange: string) => {
    let yMin: number;
    let yMax: number;
    let yText: string;
    let xText: string = "time";
    let title: string;
    let subtitle: string;
    let xMin: number;
    let xMax: number;
    let scale: string;

    if (yMaxInDataset >= 1 && yMaxInDataset <= 10) {
        yMax = Math.ceil(yMaxInDataset);
    }
    else if (yMaxInDataset >= 10 && yMaxInDataset <= 100) {
        yMax = (Math.ceil(yMaxInDataset / 10) * 10) + 10;
        // Round up to the next whole multiple of 1
    }
    else if (yMaxInDataset >= 100 && yMaxInDataset <= 1000) {
        yMax = (Math.ceil(yMaxInDataset / 10) * 10) + 10; // 
    }
    else if (yMaxInDataset >= 1000 && yMaxInDataset <= 10000) {
        yMax = (Math.ceil(yMaxInDataset / 100) * 100) + 100// Round up to the nearest whole number
    }
    else {
        yMax = Math.ceil(yMaxInDataset); // Round up to the nearest whole number
    };

    switch (chartType) {
        case ServiceChartType.index:
            yMin = 0;
            yMax = yMax;
            yText = "current fee est / moving average";
            title = "Fee Estimate Index"
            subtitle = "current fee estimate/fee estimate moving average";
            break;
        case ServiceChartType.movingAverage:
            yMin = 0;
            yMax = yMax;
            yText = "sats/B";
            title = "Fee Estimate Moving Average"
            subtitle = "sum(last n days fee estimates)/count(last n days fee estimates)";
            break;
        case ServiceChartType.feeEstimate:
            yMin = 0;
            yMax = yMax;
            yText = "sats/B";
            title = "Fee Estimate History"
            subtitle = "mempool.space (fastest/1-2 blocks)";
            break;

    }

    function getMsSinceEpochXHoursAgo(hours) {
        // Get the current time in milliseconds since epoch
        const currentTime = Date.now();
        // Calculate the time X hours ago (in milliseconds)
        const timeXHoursAgo = currentTime - (hours * 3600 * 1000);
        return timeXHoursAgo;
    };


    const getMsSinceEpochXDaysAgo = (days): number => {
        const currentDate = new Date();
        const thirtyDaysAgo = new Date(currentDate.getTime() - (days * 24 * 60 * 60 * 1000)); // Subtract 30 days in milliseconds
        return thirtyDaysAgo.getTime(); // Returns the date 30 days ago in milliseconds since epoch
    };

    function getMsSinceEpochXMonthsAgo(months) {
        const currentDate = new Date();
        const targetDate = new Date(currentDate);

        // Calculate the year and month X months ago
        targetDate.setMonth(targetDate.getMonth() - months);

        // Get the timestamp of the target date
        const timestampXMonthsAgo = targetDate.getTime();

        return timestampXMonthsAgo;
    }

    function getMsSinceEpochXYearsAgo(years) {
        const currentDate = new Date();
        const targetDate = new Date(currentDate);

        // Calculate the year X years ago
        targetDate.setFullYear(targetDate.getFullYear() - years);

        // Get the timestamp of the target date
        const timestampXYearsAgo = targetDate.getTime();

        return timestampXYearsAgo;
    }


    //set xmin and xmax based on chosen range option
    if (selectedRange === "hour") {
        xMin = getMsSinceEpochXHoursAgo(1);
        xMax = getMsSinceEpochXHoursAgo(0)
        scale = "minute";
    }

    else if (selectedRange === "day") {
        xMin = getMsSinceEpochXDaysAgo(1);
        xMax = getMsSinceEpochXDaysAgo(0);
        scale = "hour";
    }

    else if (selectedRange === "month") {
        xMin = getMsSinceEpochXMonthsAgo(1);
        xMax = getMsSinceEpochXMonthsAgo(0);
        scale = "day";
    }
    else if (selectedRange === "year") {
        xMin = getMsSinceEpochXYearsAgo(1);
        xMax = getMsSinceEpochXYearsAgo(0);
        scale = "month";
    }
    else {
        xMin = getMsSinceEpochXDaysAgo(1);
        xMax = getMsSinceEpochXDaysAgo(0);
        scale = "hour";
    }

    return {
        responsive: true,
        animation: false,
        scales: {
            x: {
                min: xMin,
                max: xMax,
                type: "time",
                time: {

                    unit: scale,
                },
                title: {
                    display: true,
                    text: xText,
                    color: titleColor,
                    font: { size: 14 },
                },
            },
            y: {
                min: yMin,
                max: yMax,
                title: {
                    display: true,
                    text: yText,
                    color: titleColor,
                    font: { size: 14 },
                },
            },
        },

        plugins: {

            title: {
                display: true,
                position: "top" as const,
                align: "start" as const,
                padding: { top: 10 },
                text: title,
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
                padding: { top: 10, bottom: 30 },
                text: subtitle,
                color: secondaryColor,
                font: {
                    family: "'Courier New', monospace" as const,
                    size: 14,
                },
            },
            tooltip: {
                enabled: true,
                mode: 'index',
                intersect: false
            },
            legend: {

                align: "start" as const,
                position: "bottom" as const,

                labels: {
                    font: {
                        family: "Courier New, monospace"
                    },
                    color: secondaryColor,
                    pointStyleWidth: 30,
                    usePointStyle: true,
                    pointStyle: "rectRounded" as const,
                },
            },
            verticalLine: {
                lineWidth: 1.5 as const,
                lineColor: "rgba(255, 0, 0, 0.75)" as const,
            },
            annotation:
                chartType == ServiceChartType.index ?
                    {
                        annotations: {
                            line1: {
                                type: "line" as const,
                                yMin: 1,
                                yMax: 1,
                                borderColor: "rgba(255,255,255,0.75)",
                                borderWidth: 1,
                            },
                        },
                    } : {},
            filler: {},
            //gradient: {},
        }
    }
};


// Type Errors are caused with react component because file is .tsx instead of .jsx 

const ChartView = ({ dataset, chartType }) => {
    const chartContainer = useRef(null);
    const [selectedScale, setSelectedScale] = useState('day');
    // Remove chartData state since it will be received as a prop
    // const [chartData, setChartData] = useState(null);
    const [chartInstance, setChartInstance] = useState(null);

    // useEffect to handle chart instance creation or update
    useEffect(() => {
        const createOrUpdateChartInstance = () => {
            if (chartInstance) {
                chartInstance.destroy();
            }

            if (chartContainer.current && dataset) {
                const yMaxInDataset: number = Math.max(...dataset.datasets.flatMap(dataset => dataset.data.map(dataPoint => dataPoint.y)));
                const options = defaultChartOptions(chartType, yMaxInDataset, selectedScale) as ChartOptions<"line">;

                const newChartInstance = new Chart(chartContainer.current, {
                    type: 'line',
                    data: dataset,
                    options: options,

                });
                setChartInstance(newChartInstance);
            }
        };

        createOrUpdateChartInstance();

        return () => {
            if (chartInstance) {
                chartInstance.destroy();
            }
        };
    }, [dataset]); // Run this effect whenever data changes

    useEffect(() => {
        if (chartInstance) {
            const yMaxInDataset: number = Math.max(...dataset.datasets.flatMap(dataset => dataset.data.map(dataPoint => dataPoint.y)));
            const updatedOptions = defaultChartOptions(chartType, yMaxInDataset, selectedScale);
            chartInstance.options = updatedOptions;
            chartInstance.update();
        }
    }, [selectedScale, chartInstance]);

    const handleScaleChange = (e) => {
        setSelectedScale(e.target.value);
    };

    const timescales = [{ "Last 1 hour": "hour" }, { "Last 1 day": "day" }, { "Last 1 month": "month" }, { "Last 1 year": "year" }];

    return (
        <div className="chart-container">
            <div className="chart-wrapper">
                <canvas ref={chartContainer} width="1800" height="1000" style={{ width: '100%', height: '100%' }}></canvas>
                <select
                    value={selectedScale}
                    onChange={handleScaleChange}
                >
                    {timescales.map((timescale, index) => {
                        // Extracting the label (key) and value from each object
                        const [label, value] = Object.entries(timescale)[0]; // Extracting the only entry

                        // Rendering the option with label as text content and value as the value attribute
                        return <option key={index} value={value}>{label}</option>; // Added 'return' statement
                    })}
                </select>

            </div>
        </div>
    );
};

export default ChartView;