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
        colorArray: [
            "rgb(0, 255, 0)",    // Green
            "rgb(255, 255, 0)",  // Yellow
            "rgb(255, 0, 0)"     // Red
        ],

        subArcs: [
            {
                limit: 0.5,
                showTick: true
            },
            { limit: 1, showTick: true },
            { limit: 2, showTick: true },
            { limit: 3, showTick: true },
            //{ limit: 4, showTick: false },
            { limit: 5, },

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
                    fontSize: 42,
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

    const addTextLabel = (svg, content, x, y, fillColor = "white") => {
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



    useEffect(() => {
        // This effect runs after the component mounts and whenever currentValue changes
        const chartContainer = document.getElementById('gaugeChartContainer');

        if (chartContainer) {
            const svg = chartContainer.querySelector('svg');
            if (svg) {
                if (svg) {
                    addTextLabel(svg, "Very Low", "10%", "90%");
                    addTextLabel(svg, "Half", "7%", "73%");
                    addTextLabel(svg, "Nominal", "7%", "50%");
                    addTextLabel(svg, "Double", "27%", "12%");
                    addTextLabel(svg, "Triple", "72%", "12%");
                    addTextLabel(svg, "Very High", "92%", "90%");

                }

            }
        }
    }, [currentValue]); // Dependency array ensures this runs when currentValue changes

    return <GaugeComponent {...gaugeProps} />;
};




export default GaugeChart;
