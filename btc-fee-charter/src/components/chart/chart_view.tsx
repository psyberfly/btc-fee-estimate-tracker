import React, { useRef, useLayoutEffect, useState, useEffect } from 'react';
import Chart, { ChartOptions } from 'chart.js/auto';
import "chartjs-adapter-date-fns";
import gradient from "chartjs-plugin-gradient";
Chart.register(gradient);
import annotationPlugin from "chartjs-plugin-annotation";
import { ServiceChartType } from '../../chart_data/interface';
import { ChartTimescale, TimescaleOptions } from "../../chart_data/chart_timescale";
Chart.register(annotationPlugin);

Chart.defaults.elements.point.pointStyle = false;
Chart.defaults.elements.point.radius = 0;
Chart.defaults.elements.line.borderWidth = 1.5;
Chart.defaults.elements.line.tension = 0;
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
const getChartOptions = (chartType: ServiceChartType, timescaleOptions: TimescaleOptions, width: number) => {
    let yMin: number = 0;
    let yText: string;
    let xText: string = "time";
    let title: string;
    let subtitle: string;
    const titleFontSize: number = width < 768 ? 16 : 24;
    const subTitleFontSize: number = width < 768 ? 14 : 20;



    switch (chartType) {
        case ServiceChartType.index:
            yText = "current fee est / moving average";
            title = "Fee Estimate Index"
            subtitle = "current fee estimate/fee estimate moving average";
            break;
        case ServiceChartType.movingAverage:
            yText = "sats/B";
            title = "Fee Estimate Weighted Moving Average"
            subtitle = "weighted sum(last n days fee estimates)/total weight";
            break;
        case ServiceChartType.feeEstimate:
            yText = "sats/B";
            title = "Fee Estimate History"
            subtitle = "mempool.space (fastest/1-2 blocks)";
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
                        size: 18,
                        family: fontFamily,
                    },
                    padding: { top: 20 }
                },
                ticks: {
                    stepSize: timescaleOptions.stepSize,
                }
            },
            y: {
                min: yMin,
                max: timescaleOptions.yMax,
                title: {
                    display: true,
                    text: yText,
                    color: textColorSeconday,
                    font: {
                        size: 18,
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
                        size:14
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

const timescales = ChartTimescale.getRangeOptions();

const ChartView = ({ dataset, chartType, selectedRange, setSelectedRange }) => {
    const chartContainer = useRef(null);
    const [chartInstance, setChartInstance] = useState(null);

    // //FOR RESPONSIVE VIEW:
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
        const createOrUpdateChartInstance = () => {
            if (chartInstance) {
                (chartInstance as any).destroy();
            }

            if (chartContainer.current && dataset) {
                const timescaleOptions = ChartTimescale.getTimescaleOptions(selectedRange, dataset.datasets);
                const options = getChartOptions(chartType, timescaleOptions, width) as ChartOptions<"line">;

                const newChartInstance = new Chart(chartContainer.current, {
                    type: 'line',
                    data: dataset,
                    options: options,

                });
                setChartInstance(newChartInstance as any);
            }
        };

        createOrUpdateChartInstance();

        return () => {
            if (chartInstance) {
                (chartInstance as any).destroy();
            }
        };
    }, [dataset]); // Run this effect whenever data changes

    useEffect(() => {
        if (chartInstance) {
            const timescaleOptions = ChartTimescale.getTimescaleOptions(selectedRange, dataset.datasets);
            const updatedOptions = getChartOptions(chartType, timescaleOptions, width) as ChartOptions<"line">;
            (chartInstance as any).options = updatedOptions;
            (chartInstance as any).update();
        }
    }, [selectedRange, chartInstance, width]);

    const handleScaleChange = (e) => {
        setSelectedRange(e.target.value);
    };


    return (
        <div className="chart-container">
            <div className="chart-wrapper">
                <select value={selectedRange} onChange={handleScaleChange}>
                    {timescales.map((timescale, index) => (
                        <option key={index} value={timescale}>
                            {timescale}
                        </option>
                    ))}
                </select>

                <canvas
                    ref={chartContainer}
                    style={{ width: '100%', height: '100%' }}
                ></canvas>

            </div>
        </div>
    );
};

export default ChartView;