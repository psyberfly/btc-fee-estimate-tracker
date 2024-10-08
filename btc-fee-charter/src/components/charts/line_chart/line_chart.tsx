import React, { useRef, useLayoutEffect, useState, useEffect } from 'react';
import Chart, { ChartOptions } from 'chart.js/auto';
import "chartjs-adapter-date-fns";
import gradient from "chartjs-plugin-gradient";
Chart.register(gradient);
import annotationPlugin from "chartjs-plugin-annotation";
import { ChartType } from "../../../chart_data/interface";
import { ChartTimescale, TimeRange, TimescaleOptions } from "../../../chart_data/chart_timescale";
import "./line_chart.css";
Chart.register(annotationPlugin);


Chart.defaults.elements.point.pointStyle = false;
Chart.defaults.elements.point.radius = 0;
Chart.defaults.elements.line.borderWidth = 1.5;
Chart.defaults.elements.line.tension = 0.0;
Chart.defaults.scales.time.adapters.date = { "timezone": "UTC" };
// Chart.defaults.backgroundColor = "rgba(0,255,0,0.2)";
Chart.defaults.scale.ticks.color = "rgb(255,255,255)";
Chart.defaults.scale.grid.color = "rgba(199, 199, 199, 0.2)";

const titleColor = "#E21F26";
const secondaryColor = "#FFFFFF";
const textColorSeconday = "rgb(225, 225, 225)";
const fontFamily = 'Helvetica, sans-serif';

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
const getChartOptions = (chartType: ChartType, timescaleOptions: TimescaleOptions, width: number, height: number, latestValue365Day: number, latestValue30Day?: number) => {
    let yMin: number = 0;
    let yText: string;
    let xText: string = "time";
    let title: string;
    let subtitle: string;
    const titleFontSize: number = width < 768 ? 16 : 24;
    const subTitleFontSize: number = width < 768 ? 14 : 20;
    const axesLabelSize: number = height < 550 ? 12 : 18;
    const latestValue365DayText = latestValue365Day.toFixed(2);
    const latestValue30DayText = latestValue30Day ? latestValue30Day.toFixed(2) : "N/A";

    const annotations = () => {

        if (latestValue30Day) {
            if (chartType === ChartType.feeIndex)
                return {
                    line1: { // Additional line annotation for the latest value
                        type: "line",
                        yMin: latestValue30DayText,
                        yMax: latestValue30DayText,
                        borderColor: "rgb(254, 112, 2)", // Example: red color for the latest value line
                        borderWidth: 1,
                        borderDash: [6, 6], // Optional: Makes the line dashed
                        label: { // Label for the latest value line
                            display: true,
                            content: `${latestValue30DayText}`,
                            position: "end",
                            backgroundColor: 'rgba(0,0,0,0.5)',
                            color: "rgb(254, 112, 2)",
                            padding: 3,
                            font: {
                                family: fontFamily,
                                size: 16
                            },
                            xAdjust: 5, // Adjust this value as needed to position the label more to the right
                            yAdjust: -10, // Adjust vertically if needed
                        }
                    },
                    line2: { // Additional line annotation for the latest value
                        type: "line",
                        yMin: latestValue365DayText,
                        yMax: latestValue365DayText,
                        borderColor: "rgb(0,228, 255)", // Example: red color for the latest value line
                        borderWidth: 1,
                        borderDash: [6, 6], // Optional: Makes the line dashed
                        label: { // Label for the latest value line
                            display: true,
                            content: `${latestValue365DayText}`,
                            position: "end",
                            backgroundColor: 'rgba(0,0,0,0.5)',
                            color: "rgb(0,228, 255)",
                            padding: 3,
                            font: {
                                family: fontFamily,
                                size: 16
                            },
                            xAdjust: 5, // Adjust this value as needed to position the label more to the right
                            yAdjust: -10, // Adjust vertically if needed
                        }
                    },
                    line3: {
                        type: "line" as const,
                        yMin: 1,
                        yMax: 1,
                        borderColor: "rgba(255,255,255,0.75)",
                        borderWidth: 1,
                    },
                }

            else return {
                line1: { // Additional line annotation for the latest value
                    type: "line",
                    yMin: latestValue30DayText,
                    yMax: latestValue30DayText,
                    borderColor: "rgb(254, 112, 2)", // Example: red color for the latest value line
                    borderWidth: 1,
                    borderDash: [6, 6], // Optional: Makes the line dashed
                    label: { // Label for the latest value line
                        display: true,
                        content: `${latestValue30DayText} sats/B`,
                        position: "end",
                        backgroundColor: 'rgba(0,0,0,0.5)',
                        color: "rgb(254, 112, 2)",
                        padding: 3,
                        font: {
                            family: fontFamily,
                            size: 16
                        },
                        xAdjust: 5, // Adjust this value as needed to position the label more to the right
                        yAdjust: -10, // Adjust vertically if needed
                    }
                },
                line2: { // Additional line annotation for the latest value
                    type: "line",
                    yMin: latestValue365DayText,
                    yMax: latestValue365DayText,
                    borderColor: "rgb(0,228, 255)", // Example: red color for the latest value line
                    borderWidth: 1,
                    borderDash: [6, 6], // Optional: Makes the line dashed
                    label: { // Label for the latest value line
                        display: true,
                        content: `${latestValue365DayText} sats/B`,
                        position: "end",
                        backgroundColor: 'rgba(0,0,0,0.5)',
                        color: "rgb(0,228, 255)",
                        padding: 3,
                        font: {
                            family: fontFamily,
                            size: 16
                        },
                        xAdjust: 5, // Adjust this value as needed to position the label more to the right
                        yAdjust: -10, // Adjust vertically if needed
                    }
                },
            }
        }
        else {
            return {
                line1: { // Additional line annotation for the latest value
                    type: "line",
                    yMin: latestValue365DayText,
                    yMax: latestValue365DayText,
                    borderColor: "rgb(0,228, 255)", // Example: red color for the latest value line
                    borderWidth: 1,
                    borderDash: [6, 6], // Optional: Makes the line dashed
                    label: { // Label for the latest value line
                        display: true,
                        content: `${latestValue365DayText} sats/B`,
                        position: "end",
                        backgroundColor: 'rgba(0,0,0,0.5)',
                        color: "rgb(0,228, 255)",
                        padding: 3,
                        font: {
                            family: fontFamily,
                            size: 16
                        },
                        xAdjust: 5, // Adjust this value as needed to position the label more to the right
                        yAdjust: -10, // Adjust vertically if needed
                    }
                },
            }
        }
    }



    switch (chartType) {
        case ChartType.feeIndex:
            yText = "fee estimate / moving average";
            title = "Fee Multiple"
            subtitle = "fee estimate / moving average";
            break;
        case ChartType.movingAverage:
            yText = "sats/B";
            title = "Fee Estimate Weighted Moving Average"
            subtitle = "weighted sum(last n days fee estimates) / total weight";
            break;
        case ChartType.feeEstimate:
            yText = "sats/B";
            title = "Fee Estimate History"
            subtitle = "mempool.space (fastest / 1-2 blocks)";
            break;
        default:
            yText = "Y Label";
            title = "Unknown chart type"
            subtitle = "Subtitle";

    }

    return {
        responsive: true,
        maintainAspectRatio: false, //false=stretch to fit
        animation: false,
        layout: {
            padding: {
                top: 50,
                bottom: 20, // Adjust the value to meet your needs
            }
        },
        scales: {
            x: {
                min: timescaleOptions.xMin,
                max: timescaleOptions.xMax,
                type: "time",
                time: {
                    unit: timescaleOptions.unit,
                },
                title: {
                    display: true,
                    text: xText,
                    color: textColorSeconday,
                    font: {
                        size: axesLabelSize,
                        family: fontFamily,
                    },
                    padding: { top: 20 }
                },
                ticks: {
                    stepSize: timescaleOptions.stepSize,
                }
            },
            y: {
                type: "logarithmic",
                min: yMin,
                max: timescaleOptions.yMax,
                title: {
                    display: true,
                    text: yText,
                    color: textColorSeconday,
                    font: {
                        size: axesLabelSize,
                        family: fontFamily,
                    },
                    padding: { bottom: 20 }
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
                    family: fontFamily,
                    size: titleFontSize,
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
                    family: fontFamily,
                    size: subTitleFontSize,
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
                        family: fontFamily,
                        size: 14
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

            {
                annotations: annotations()
            },
            filler: {},
            //gradient: {},
        }
    }
};

const timescales = ChartTimescale.getRangeOptions();

function filterDatasetStepsize(dataset, intervalHours = 12) {
    // Assuming each dataset has a 'data' array with each point having an 'x' property (timestamp)
    return dataset.map(dataSeries => {
        let lastTimestamp: number;
        const interval = intervalHours * 60 * 60 * 1000; // Convert hours to milliseconds
        const filteredData = dataSeries.data.filter(point => {
            if (!lastTimestamp || new Date(point.x).getTime() - lastTimestamp >= interval) {
                lastTimestamp = new Date(point.x).getTime();
                return true;
            }
            return false;
        });
        return { ...dataSeries, data: filteredData };
    });
}

const LineChart = ({ dataset, chartType, selectedRange, setSelectedRange }) => {
    const chartContainer = useRef(null);
    const chartInstance = useRef(null);    // //FOR RESPONSIVE VIEW:
    const [width, height] = useWindowSize();

    function useWindowSize() {
        const [size, setSize] = useState([window.innerWidth, window.innerHeight]);

        useLayoutEffect(() => {
            function updateSize() {
                setSize([window.innerWidth, window.innerHeight]);
            }

            window.addEventListener('resize', updateSize);
            updateSize();

            return () => window.removeEventListener('resize', updateSize);
        }, []);

        return size;
    }
    useEffect(() => {
        const createChart = () => {
            if (!chartContainer.current) return;

            // Ensure the existing chart instance is destroyed before creating a new one
            if (chartInstance.current) {
                (chartInstance.current as any).destroy();
                chartInstance.current = null;
            }

            let processedDataset = dataset;
            // Check if selectedRange requires dataset filtering
            if ([
                TimeRange.Last5Days,
                TimeRange.Last1Month,
                TimeRange.Last5Months,
                TimeRange.Last1Year,
                TimeRange.Last5Years,
                TimeRange.AllTime,

            ].includes(selectedRange)) {
                // Filter dataset for every 12 hours if selectedRange is beyond the last 5 days
                let intervalHours: number;
                if (selectedRange === TimeRange.Last5Days) {
                    intervalHours = 1;
                }
                else if (selectedRange === TimeRange.Last1Month) {
                    intervalHours = 6;
                }
                else if (selectedRange === TimeRange.Last5Months || selectedRange === TimeRange.Last1Year) {
                    intervalHours = 12;
                }
                else {
                    intervalHours = 24;
                }
                processedDataset = { ...dataset, datasets: filterDatasetStepsize(dataset.datasets, intervalHours) };
            }

            const timescaleOptions = ChartTimescale.getTimescaleOptions(selectedRange, dataset.datasets);
            let latestValue30Day: number | undefined;
            let latestValue365Day: number;
            if (dataset.datasets.length > 1) {

                latestValue30Day = !dataset.datasets[0]["data"][dataset.datasets[0].data.length - 1] ? NaN : parseFloat(dataset.datasets[0]["data"][dataset.datasets[0].data.length - 1]["y"]);

                latestValue365Day = !dataset.datasets[0]["data"][dataset.datasets[0].data.length - 1] ? NaN : parseFloat(dataset.datasets[1]["data"][dataset.datasets[0].data.length - 1]["y"]);
            }
            else {
                latestValue365Day = parseFloat(dataset.datasets[0]["data"][dataset.datasets[0].data.length - 1]["y"]);
                latestValue30Day = undefined;
            }
            const options = getChartOptions(chartType, timescaleOptions, width, height, latestValue365Day, latestValue30Day) as ChartOptions<"line">;

            const newChartInstance = new Chart(chartContainer.current, {
                type: 'line',
                data: processedDataset,
                options,
            });

            chartInstance.current = newChartInstance as any;
        };

        if (dataset && dataset.datasets.length > 0) {
            createChart();
        }
        else
        {
            console.error("LineChart: Error creating chart: Null dataset or dataset length zero.");
            return;
        }
        // Cleanup function to destroy the chart instance when the component unmounts
        return () => {
            if (chartInstance.current) {
                (chartInstance.current as any).destroy();
                chartInstance.current = null;
            }
        };
    }, [dataset, selectedRange, width, height]); // Dependency array


    const handleScaleChange = (e) => {
        setSelectedRange(e.target.value);
    };


    return (
        <div className="chart-container">
            <div className="chart-wrapper">
                <select 
                 id="timeRangeSelect" // Unique identifier for the element
                 name="timeRange" // Name used when sending data in a form submission
                value={selectedRange} onChange={handleScaleChange}>
                    {timescales.map((timescale, index) => (
                        <option key={index} value={timescale}>
                            {timescale}
                        </option>
                    ))}
                </select>

                <canvas
                    ref={chartContainer}
                //style={{ width: '100%', height: '100%' }}
                ></canvas>

            </div>
        </div>
    );
};

export default LineChart;