import React, { useEffect } from 'react';
import GaugeComponent from 'react-gauge-component'; // Adjust with the correct import based on actual package
import { Arc, SubArc } from 'react-gauge-component/dist/lib/GaugeComponent/types/Arc';
import { GaugeComponentProps, GaugeType } from 'react-gauge-component/dist/lib/GaugeComponent/types/GaugeComponentProps';
import { PointerProps } from 'react-gauge-component/dist/lib/GaugeComponent/types/Pointer';
import { FeeIndex } from '../../store/interface';
import { Tick } from 'react-gauge-component/dist/lib/GaugeComponent/types/Tick';

const GaugeChart = ({ currentValue, feeIndexesLastYear }) => {
    // Define the gauge properties based on the GaugeComponentProps interface


    function getPercentileRepresentatives(feeIndexes: FeeIndex[]): number[] {


        const normalizedFeeIndexes = feeIndexes.map(feeIndex => ({
            ...feeIndex,
            ratioLast365Days: Number(feeIndex.ratioLast365Days),
            ratioLast30Days: Number(feeIndex.ratioLast30Days), // Similarly, ensure ratioLast30Days is a number
            time: feeIndex.time instanceof Date ? feeIndex.time : new Date(feeIndex.time) // Ensuring time is a Date object
        }));


        // Aggregate by day: Calculate daily averages for ratioLast365Day    

        const dailyAverages: { [key: string]: number[] } = {};
        normalizedFeeIndexes.forEach(feeIndex => {
            const entryTime = feeIndex.time; // Already ensured to be a Date object
            const dayKey = entryTime.toISOString().split('T')[0]; // Extract date part
            if (!dailyAverages[dayKey]) {
                dailyAverages[dayKey] = [];
            }
            dailyAverages[dayKey].push(feeIndex.ratioLast365Days);
        });
        const dailyRepresentatives: FeeIndex[] = Object.keys(dailyAverages).map(day => {
            const averages = dailyAverages[day];
            const sum = averages.reduce((acc, curr) => acc + curr, 0);
            const ratioLast365Days = averages.length > 0 ? sum / averages.length : 0;
            if (isNaN(ratioLast365Days)) {
                console.log('NaN Ratio:', ratioLast365Days, sum, averages.length);

            }
            return {
                time: new Date(day),
                ratioLast365Days: ratioLast365Days, // Daily average
                ratioLast30Days: 0 // Placeholder, adjust as needed
            };
        });

        // Proceed with the percentile calculation on the aggregated data
        // Step 1: Sort the aggregated data
        const sortedIndexes = dailyRepresentatives.sort((a, b) => a.ratioLast365Days - b.ratioLast365Days);

        // Step 2: Calculate the number of items per percentile
        const itemsPerPercentile = Math.ceil(sortedIndexes.length / 10);

        // Step 3: Extract a representative value for each percentile
        const representatives: number[] = [];

        for (let i = 0; i < 10; i++) {
            const percentileGroup = sortedIndexes.slice(i * itemsPerPercentile, (i + 1) * itemsPerPercentile);
            if (percentileGroup.length > 0) {
                // Choosing the median value as the representative
                const midIndex = Math.floor(percentileGroup.length / 2);
                const representativeValue = percentileGroup[midIndex].ratioLast365Days;
                representatives.push(representativeValue);

            }
        }

        return representatives;
    }

    function getTicks(values: number[]): Tick[] {
        let ticks: Tick[] = [];
        values.forEach((value) => {
            ticks.push({
                value: value, valueConfig: {
                    // style: {
                    //     //fontSize: 30,
                    //     //color: "rgba(255,0,0,1)",

                    // },
                   // formatTextValue: (value) => value,
                    maxDecimalDigits: 2,
                    hide: false

                }
            })
        });

        return ticks;
    }


    function getSubArcs(values: number[]): SubArc[] {
        let subArcs: SubArc[] = [];
        values.forEach((value) => {
            subArcs.push({ limit: value, })
        });

        return subArcs as SubArc[];

    }

    const pointerProps: PointerProps = {
        type: "needle",
        color: "rgba(180,180,180,0.85)",
        baseColor: "rgba(190,190,190,1)",
        animate: true,
    }

    const scaleValues = getPercentileRepresentatives(feeIndexesLastYear);

    const subArcs = getSubArcs(scaleValues);
    const tickValues = getTicks(scaleValues);
    const minValue = scaleValues[0];
    const maxValue = scaleValues[scaleValues.length - 1]

    const arc: Arc = {
        //        gradient: true,
        colorArray: [
            "rgb(0, 255, 0)",
            "rgb(255, 255, 0)",  // Yellow
            "rgb(255, 0, 0)"     // Red
        ],
        subArcs: subArcs,


        // subArcs: [
        //     {
        //         limit: 0.5,
        //         showTick: true,
        //         color: "rgb(0, 255, 0)",    // Green
        //     },
        //     {
        //         limit: 1, showTick: true,
        //         color: "rgb(255, 255, 0)",
        //     }, // Yellow},
        //     {
        //         limit: 2, showTick: true,
        //         color: "rgb(255, 165, 0)",
        //     },
        //     {
        //         limit: 3, showTick: true, color: "rgb(255, 82, 0)",
        //     },
        //     //{ limit: 4, showTick: false },
        //     {
        //         limit: 5, color: "rgb(255, 0, 0)",
        //     },

        // ],
        cornerRadius: 1,
    }

    const gaugeProps: GaugeComponentProps = {
        id: 'gaugeChartContainer',
        value: currentValue,
        minValue: 0,
        maxValue: maxValue,
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
                type: "outer",
                defaultTickValueConfig: {
                    style: {
                        fontSize: "12px",
                        color: "rgb(255,255,255)",
                        fontWeight: "bold"
                    },
                },
                ticks: tickValues,
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
        // const chartContainer = document.getElementById('gaugeChartContainer');

        // if (chartContainer) {
        //     const svg = chartContainer.querySelector('svg');
        //     if (svg) {
        //         if (svg) {
        //             addTickLabel(svg, "Very Low", "10%", "90%");
        //             addTickLabel(svg, "Half", "7%", "73%");
        //             addTickLabel(svg, "Nominal", "7%", "50%");
        //             addTickLabel(svg, "Double", "27%", "12%");
        //             addTickLabel(svg, "Triple", "72%", "12%");
        //             addTickLabel(svg, "Very High", "92%", "90%");
        //             addValueLabel(svg, "50%", "73%")

        //         }

        //     }
        // }
    }, [currentValue]); // Dependency array ensures this runs when currentValue changes

    return <GaugeComponent {...gaugeProps} />;
};




export default GaugeChart;
