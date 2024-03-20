import React, { useEffect } from 'react';
import GaugeComponent from 'react-gauge-component'; // Adjust with the correct import based on actual package
import { Arc } from 'react-gauge-component/dist/lib/GaugeComponent/types/Arc';
import { GaugeComponentProps, GaugeType } from 'react-gauge-component/dist/lib/GaugeComponent/types/GaugeComponentProps';
import { PointerProps } from 'react-gauge-component/dist/lib/GaugeComponent/types/Pointer';

const GaugeChart = ({ currentValue }) => {
    // Define the gauge properties based on the GaugeComponentProps interface

    const pointerProps: PointerProps = {
        type: "needle",
        color: "rgba(180,180,180,0.85)",
        baseColor: "rgba(190,190,190,1)",
        animate: true,
    }

    const arc: Arc = {
        //padding: 22,
        //nbSubArcs: 4,
        //gradient: true,
        // colorArray: [

        //     // "rgb(255, 255, 0)",  // Yellow
        //     // "rgb(255, 165, 0)",  // Yellow
        //     // "rgb(255, 0, 0)"     // Red
        // ],

        subArcs: [
            {
                limit: 0.5,
                showTick: true,
                color: "rgb(0, 255, 0)",    // Green
            },
            {
                limit: 1, showTick: true,
                color: "rgb(255, 255, 0)",
            }, // Yellow},
            {
                limit: 2, showTick: true,
                color: "rgb(255, 165, 0)",
            },
            {
                limit: 3, showTick: true, color: "rgb(255, 82, 0)",
            },
            //{ limit: 4, showTick: false },
            {
                limit: 5, color: "rgb(255, 0, 0)",
            },

        ],
        cornerRadius: 1,
    }

    const gaugeProps: GaugeComponentProps = {
        id: 'gaugeChartContainer',
        value: currentValue,
        minValue: 0,
        maxValue: 5,
        type: GaugeType.Radial,
        pointer: pointerProps,
        labels: {
            valueLabel: {
                style: {
                    fontSize: 35,
                    padding: "100px",
                },
                matchColorWithArc: true,
                maxDecimalDigits: 2,
                // formatTextValue: (value) => {
                //     if (value < 1)
                //         return "Low Fee"

                //     else
                //         return "High Fee"
                // }
            },
            tickLabels: {
                type: "inner",
                defaultTickValueConfig: {
                    style: {
                        fontSize: 24,
                        color: "rgb(255,255,255)",
                    },
                },
                ticks: [{ value: 0, }, { value: 1 }, { value: 2 }, { value: 3 }, { value: 5, valueConfig: { formatTextValue: (value) => "5+" } }],
            }
        },

        arc: arc,

        // Include any other props as needed
    };

    const addTickLabel = (svg, content, x, y, fillColor = "white") => {
        const textLabel = document.createElementNS("http://www.w3.org/2000/svg", "text");
        textLabel.setAttribute("x", x);
        textLabel.setAttribute("y", y);
        textLabel.setAttribute("text-anchor", "middle");
        textLabel.textContent = content;
        textLabel.style.fontSize = "14px";
        textLabel.style.fontWeight = "bold";
        textLabel.style.fill = fillColor;
        svg.appendChild(textLabel);
    };

    const addValueLabel = (svg, x, y,) => {
        let fillColor: string;
        let text: string = "";
        if (currentValue < 0.5) {
            fillColor = "rgb(0,255,0)";
            text = "Very Low";
        }

        else if (currentValue > 0.5 && currentValue < 1) {
            fillColor = "rgb(255,255,0)";
            text = "Low";
        }
        else if (currentValue > 1 && currentValue < 2) {
            fillColor = "rgb(255,165,0)";
            text = "High"
        }
        else if (currentValue > 2 && currentValue < 3) {
            fillColor = "rgb(255, 82, 0)";
            text = "Very High"
        }
        else {
            fillColor = "rgb(255,0,0)";
            text = "Very High"
        }


        const textLabel = document.createElementNS("http://www.w3.org/2000/svg", "text");
        textLabel.setAttribute("x", x);
        textLabel.setAttribute("y", y);
        textLabel.setAttribute("text-anchor", "middle");
        textLabel.textContent = text;
        textLabel.style.fontSize = "28px";
        textLabel.style.fontWeight = "normal";
        textLabel.style.fill = fillColor;
        svg.appendChild(textLabel);
    };



    useEffect(() => {
        // This effect runs after the component mounts and whenever currentValue changes
        const chartContainer = document.getElementById('gaugeChartContainer');

        if (chartContainer) {
            const svg = chartContainer.querySelector('svg');
            if (svg) {
                if (svg) {
                    addTickLabel(svg, "Very Low", "10%", "90%");
                    addTickLabel(svg, "Half", "7%", "73%");
                    addTickLabel(svg, "Nominal", "7%", "50%");
                    addTickLabel(svg, "Double", "27%", "12%");
                    addTickLabel(svg, "Triple", "72%", "12%");
                    addTickLabel(svg, "Very High", "92%", "90%");
                    addValueLabel(svg, "50%", "73%")

                }

            }
        }
    }, [currentValue]); // Dependency array ensures this runs when currentValue changes

    return <GaugeComponent {...gaugeProps} />;
};




export default GaugeChart;
