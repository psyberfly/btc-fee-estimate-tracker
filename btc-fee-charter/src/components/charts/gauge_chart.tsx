import React, { useEffect } from 'react';
import GaugeComponent from 'react-gauge-component'; // Adjust with the correct import based on actual package
import { Arc, SubArc } from 'react-gauge-component/dist/lib/GaugeComponent/types/Arc';
import { GaugeComponentProps, GaugeType } from 'react-gauge-component/dist/lib/GaugeComponent/types/GaugeComponentProps';
import { PointerProps } from 'react-gauge-component/dist/lib/GaugeComponent/types/Pointer';
import { FeeIndex } from '../../store/interface';
import { Tick } from 'react-gauge-component/dist/lib/GaugeComponent/types/Tick';

const GaugeChart = ({ currentFeeIndex, feeIndexHistoryLastYear }) => {

    function aggregateByDay(feeIndexHistory: FeeIndex[]): FeeIndex[] {
        // Object to hold the sum and count for each date
        const aggregates: { [dateKey: string]: { sum365: number, sum30: number, count: number } } = {};

        // Iterate over each entry in the fee index history
        feeIndexHistory.forEach(entry => {
            // Ensure time is a Date object
            const entryTime = entry.time instanceof Date ? entry.time : new Date(entry.time);
            // Convert time to a string key (YYYY-MM-DD)
            const dateKey = entryTime.toISOString().split('T')[0];

            // Initialize the date key in aggregates if not present
            if (!aggregates[dateKey]) {
                aggregates[dateKey] = { sum365: 0, sum30: 0, count: 0 };
            }

            // Accumulate sums and increment count
            aggregates[dateKey].sum365 += Number(entry.ratioLast365Days);
            aggregates[dateKey].sum30 += Number(entry.ratioLast30Days);
            aggregates[dateKey].count++;
        });

        // Convert the aggregates object into an array of FeeIndex
        return Object.keys(aggregates).map(date => ({
            time: new Date(date),
            ratioLast365Days: aggregates[date].sum365 / aggregates[date].count,
            ratioLast30Days: aggregates[date].sum30 / aggregates[date].count,
        }));
    }

    const indexPercentageHigher = (): number => {

        const aggregatedHistory = aggregateByDay(feeIndexHistoryLastYear);

        const percentageHigherLastYear = aggregatedHistory.filter(index => index.ratioLast365Days > currentFeeIndex.ratioLast365Days).length / aggregatedHistory.length * 100;

        // const percentageHigherLastMonth = (aggregatedHistory.filter(index => index.ratioLast30Days > currentFeeIndex.ratioLast30Days).length / aggregatedHistory.length) * 100;

        // return `The multiple has been higher ${percentageHigherLastYear.toFixed(2)}% of the time last year and ${percentageHigherLastMonth.toFixed(2)}%. of the time last month`;

        return percentageHigherLastYear;
    }
    const currentGaugeValue = (): number => {
        const percentageHigherLastYear = indexPercentageHigher();
      
        if (percentageHigherLastYear >= 90) {
          return 1; // "Fees are at extremely low"
        } else if (percentageHigherLastYear >= 80) {
          return 2; // "Fees are very low"
        } else if (percentageHigherLastYear >= 70) {
          return 3; // "Fees are low"
        } else if (percentageHigherLastYear >= 60) {
          return 4; // "Fees are average-low"
        } else if (percentageHigherLastYear >= 50) {
          return 5; // "Fees average"
        } else if (percentageHigherLastYear >= 40) {
          return 6; // "Fees are average-high"
        } else if (percentageHigherLastYear >= 30) {
          return 7; // "Fees are high"
        } else if (percentageHigherLastYear >= 20) {
          return 8; // "Fees are very high"
        } else if (percentageHigherLastYear >= 10) {
          return 9; // "Fees are extremely high"
        } else {
          return 10; // "Warning: fees are at their highest"
        }
      };
      



    function getScaleValues(): number[] {
        return [1, 2, 3, 4, 5, 6, 7, 8, 9, 10]
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

    const scaleValues = getScaleValues();

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
        value: currentGaugeValue(),
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
        if (currentFeeIndex < 0.5) {
            fillColor = "rgb(0,255,0)";
            text = "Very Low";
        }

        else if (currentFeeIndex > 0.5 && currentFeeIndex < 1) {
            fillColor = "rgb(255,255,0)";
            text = "Low";
        }
        else if (currentFeeIndex > 1 && currentFeeIndex < 2) {
            fillColor = "rgb(255,165,0)";
            text = "High"
        }
        else if (currentFeeIndex > 2 && currentFeeIndex < 3) {
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
    }, [currentFeeIndex]); // Dependency array ensures this runs when currentValue changes

    return (
        <>
            <p style={{ paddingTop: "0px", paddingBottom: "0vh", textAlign: "center" }}>
                The multiple has been higher {indexPercentageHigher()}% of the time last year
            </p>
            <GaugeComponent {...gaugeProps} />
        </>
    );

};



export default GaugeChart;
