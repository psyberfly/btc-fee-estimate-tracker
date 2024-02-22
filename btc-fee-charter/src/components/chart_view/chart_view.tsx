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
Chart.defaults.backgroundColor = "rgba(0,255,0,0.2)";
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
const defaultChartOptions = (chartType: ServiceChartType) => {
    let yMin: number;
    let yMax: number;
    let yText: string;
    let xText: string = "time";
    let title: string;
    let subtitle: string;


    switch (chartType) {
        case ServiceChartType.index:
            yMin = 0;
            yMax = 2;
            yText = "current fee est / moving average";
            title = "Fee Estimate Index"
            subtitle = "current fee estimate / fee estimate moving average";
            break;
        case ServiceChartType.movingAverage:
            yMin = 0;
            yMax = 100;
            yText = "sats/B";
            title = "Fee Estimate Moving Average"
            subtitle = "30 Day Moving Average";
            break;
        case ServiceChartType.feeEstimate:
            yMin = 0;
            yMax = 100;
            yText = "sats/B";
            title = "Fee Estimate History"
            subtitle = "mempool.space";
            break;
    }

    return {

        scales: {
            x: {
                type: "time",
                time: {
                    unit: "hour",
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
        responsive: true,
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
                enabled: true as const,
                intersect: false as const,
                borderColor: "red"
            },
            legend: {
                align: "start" as const,
                position: "bottom" as const,
                labels: {
                    pointStyleWidth: 40,
                    usePointStyle: true,
                    pointStyle: "rectRounded" as const,
                },
            },
            verticalLine: {
                lineWidth: 1.5 as const,
                lineColor: "rgba(255, 0, 0, 0.75)" as const,
            },
            // annotation: {
            //     annotations: {
            //         line1: {
            //             type: "line" as const,
            //             yMin: 1,
            //             yMax: 1,
            //             borderColor: secondaryColor,
            //             borderWidth: 1,
            //         },
            //     },
            // },
            //filler: {},
            gradient: {},
        }
    }
};

const ChartView = ({ dataset, chartType }) => {
    const chartContainer = useRef(null);
    const [selectedScale, setSelectedScale] = useState('hour');
    // Remove chartData state since it will be received as a prop
    // const [chartData, setChartData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [chartInstance, setChartInstance] = useState(null);

    // useEffect to handle chart instance creation or update
    useEffect(() => {
        const createOrUpdateChartInstance = () => {
            if (chartInstance) {
                chartInstance.destroy();
            }

            if (chartContainer.current && dataset) {
                const newChartInstance = new Chart(chartContainer.current, {
                    type: 'line',
                    data: dataset,
                    options: defaultChartOptions as ChartOptions<"line">

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
            const updatedOptions = defaultChartOptions(chartType);
            updatedOptions.scales!.x!["time"]["unit"] = selectedScale;
            chartInstance.options = updatedOptions;
            chartInstance.update();
        }
    }, [selectedScale, chartInstance]);

    const handleScaleChange = (e) => {
        setSelectedScale(e.target.value);
    };

    const scales = ["hour", "day", "month"];

    return (
        <div className="chart-container">
            <div className="chart-wrapper">
                <canvas ref={chartContainer} width="1800" height="1000" style={{ width: '100%', height: '100%' }}></canvas>
                <select
                    value={selectedScale}
                    onChange={handleScaleChange}
                >
                    {scales.map(scale => (
                        <option key={scale} value={scale}>{scale}</option>
                    ))}
                </select>
            </div>
        </div>
    );
};

export default ChartView;