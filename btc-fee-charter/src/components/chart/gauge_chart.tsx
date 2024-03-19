import React from 'react';
import GaugeComponent from 'react-gauge-component'; // Adjust with the correct import based on actual package
import { Arc } from 'react-gauge-component/dist/lib/GaugeComponent/types/Arc';
import { GaugeComponentProps, GaugeType } from 'react-gauge-component/dist/lib/GaugeComponent/types/GaugeComponentProps';
import { PointerProps } from 'react-gauge-component/dist/lib/GaugeComponent/types/Pointer';

const GaugeChart = ({ currentValue }) => {
    // Define the gauge properties based on the GaugeComponentProps interface

    const pointerProps: PointerProps = {
        type: "needle",
        color: "rgb(190,190,190)"
    }

    const arc: Arc = {
        gradient: true,
        colorArray: [
            "rgb(0,255,0)",
            "rgb(255,255,0)",
            "rgb(255,0,0)"

        ],
        subArcs: [
            { limit: 0, showTick: true },
            { limit: 1, showTick: true },
            { limit: 2, showTick: true },

        ],
        cornerRadius: 1,
    }

    const gaugeProps: GaugeComponentProps = {

        value: currentValue,
        minValue: 0,
        maxValue: 2,
        type: GaugeType.Semicircle,
        pointer: pointerProps,
        labels: {
            valueLabel: {
                style: {
                    fontSize: 42,
                },
                matchColorWithArc: true,
                formatTextValue: (value) => {
                    if (value < 1)
                        return "Low Fee"

                    else
                        return "High Fee"
                }
            },
            tickLabels: {
                defaultTickValueConfig: {
                    style: {
                        fontSize: 24,
                        color: "rgb(255,255,255)",
                    },
                },
                ticks: [{ value: 0, }, { value: 1, }, { value: 2 },],
            }
        },

        arc: arc,

        // Include any other props as needed
    };

    return <GaugeComponent {...gaugeProps} />;
};

export default GaugeChart;
