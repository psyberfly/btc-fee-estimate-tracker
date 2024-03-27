import React, { useEffect } from 'react';
import GaugeComponent from 'react-gauge-component'; // Adjust with the correct import based on actual package
import { Arc, SubArc } from 'react-gauge-component/dist/lib/GaugeComponent/types/Arc';
import { GaugeComponentProps, GaugeType } from 'react-gauge-component/dist/lib/GaugeComponent/types/GaugeComponentProps';
import { PointerProps } from 'react-gauge-component/dist/lib/GaugeComponent/types/Pointer';
import { FeeIndex } from '../../store/interface';
import { Tick } from 'react-gauge-component/dist/lib/GaugeComponent/types/Tick';

export enum GaugeChartType { monthly, yearly };

const GaugeChart = ({ currentFeeIndex, feeIndexHistoryLastYear, gaugeChartType }) => {

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
            if (gaugeChartType === GaugeChartType.yearly) {
                aggregates[dateKey].sum365 += Number(entry.ratioLast365Days);

            }
            else if (gaugeChartType === GaugeChartType.monthly) {
                aggregates[dateKey].sum30 += Number(entry.ratioLast30Days);

            }
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

        let percentageHigher: number;

        if (gaugeChartType === GaugeChartType.yearly) {
            const percentageHigherLastYear = aggregatedHistory.filter(index => index.ratioLast365Days > currentFeeIndex).length / aggregatedHistory.length * 100;
            percentageHigher = percentageHigherLastYear;
        }

        else {
            const percentageHigherLastMonth = (aggregatedHistory.filter(index => index.ratioLast30Days > currentFeeIndex).length / aggregatedHistory.length) * 100;
            percentageHigher = percentageHigherLastMonth;

        }

        return percentageHigher;
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

    const currentGaugeValueLabel = (value: number): string => {
        switch (value) {
            case 1:
                return "extremely low";
            case 2:
                return "very low";
            case 3:
                return "low";
            case 4:
                return "average-low";
            case 5:
                return "average";
            case 6:
                return "average-high";
            case 7:
                return "high";
            case 8:
                return "very high";
            case 9:
                return "extremely high";
            case 10:
                return "at their highest";
            default:
                return "Invalid value";
        }
    };

    const adjustFontSizeForLabel = (label) => {
        const baseSize = 18; // Starting font size for very short strings
        const growthFactor = 2; // How much the font size increases with each additional character

        // Calculate the adjusted font size based on the length of the label
        const adjustedFontSize = baseSize + (label.length * growthFactor);

        // Optionally, you can set a maximum font size
        const maxFontSize = 60;

        // Clamp the adjusted font size to not exceed the maximum font size
        const clampedFontSize = Math.min(adjustedFontSize, maxFontSize);

        return `${clampedFontSize}px`;
    };

    function getScaleValues(): number[] {
        return [1, 2, 3, 4, 5, 6, 7, 8, 9, 10]
    }

    function getTicks(values: number[]): Tick[] {
        let ticks: Tick[] = [];
        values.forEach((value) => {
            ticks.push({
                value: value, valueConfig: {
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
    const fontFamily = 'Helvetica, sans-serif';

    const arc: Arc = {
        //        gradient: true,
        width: 0.15,
        colorArray: [
            "rgb(0, 255, 0)",
            "rgb(255, 255, 0)",  // Yellow
            "rgb(255, 0, 0)"     // Red
        ],
        subArcs: subArcs,
        cornerRadius: 1,
    }

    const currentValue = currentGaugeValue();
    const currentValueLabel = currentGaugeValueLabel(currentValue);
    const currentValueLabelSize = adjustFontSizeForLabel(currentValueLabel);
    const chartId = gaugeChartType === GaugeChartType.yearly ? "gaugeChartContainerYearly" : "gaugeChartContainerMonthly";
    const gaugeProps: GaugeComponentProps = {
        id: chartId,
        value: currentValue,
        minValue: minValue,
        maxValue: maxValue,
        type: GaugeType.Radial,
        pointer: pointerProps,
        labels: {
            valueLabel: {
                style: {
                    fontSize: currentValueLabelSize,
                    fontFamily: fontFamily,
                    backgroundColor: "rgb(255,255,255)"

                },
                matchColorWithArc: true,
                maxDecimalDigits: 2,
                formatTextValue: (value) =>
                    currentValueLabel

            },
            tickLabels: {
                type: "inner",
                defaultTickValueConfig: {
                    style: {
                        fontSize: "14px",
                        color: "rgb(255,255,255)",
                        fontWeight: "bold",
                        fontFamily: fontFamily,
                    },
                },
                ticks: tickValues,
            }
        },

        arc: arc,

    };

    const addAdditionalLabel = (svg, content, x, y, fillColor = "white") => {
        const textLabel = document.createElementNS("http://www.w3.org/2000/svg", "text");
        textLabel.setAttribute("x", x);
        textLabel.setAttribute("y", y);
        textLabel.setAttribute("text-anchor", "middle");
        textLabel.textContent = content;
        textLabel.style.fontSize = "18px";
        textLabel.style.fontFamily = fontFamily;
        textLabel.style.fill = fillColor;
        svg.appendChild(textLabel);
    };

    useEffect(() => {
        // This effect runs after the component mounts and whenever currentValue changes
        const chartContainer = document.getElementById(chartId);

        let xPos: string = "50%";
        let yPos: string = "77.5%";

              if (chartContainer) {
            const svg = chartContainer.querySelector('svg');
            if (svg) {
                if (svg) {
                    addAdditionalLabel(svg, "fees are", xPos, yPos);
                }

            }
        }
    }, [currentFeeIndex]);


    return (
        <>
            <p style={{ paddingTop: "0px", paddingBottom: "0vh", textAlign: "center" }}>
                The multiple has been higher {indexPercentageHigher().toFixed(2)}% of the time last {gaugeChartType === GaugeChartType.yearly? "year" : "month"}
            </p>
            <GaugeComponent {...gaugeProps} />
        </>
    );

};



export default GaugeChart;
