import React, { useEffect } from 'react';
import GaugeComponent from 'react-gauge-component';
import { Arc, SubArc } from 'react-gauge-component/dist/lib/GaugeComponent/types/Arc';
import { GaugeComponentProps, GaugeType } from 'react-gauge-component/dist/lib/GaugeComponent/types/GaugeComponentProps';
import { PointerProps } from 'react-gauge-component/dist/lib/GaugeComponent/types/Pointer';
import { Tick } from 'react-gauge-component/dist/lib/GaugeComponent/types/Tick';
import "./gauge_chart.css";
import { FeeIndex } from '../../../store/interface';

export enum GaugeChartType { monthly, yearly };

const GaugeChart = ({ currentFeeIndex, feeIndexHistoryLastYear, feeEstimateHistoryLastYear, currentFeeSatsPerVb, gaugeChartType }) => {
    // Aggregate daily ratios (UTC) for the selected gauge type
    function aggregateDailyRatios(history: FeeIndex[], type: GaugeChartType): { time: Date, ratio: number }[] {
        const aggregates: { [dateKey: string]: { sum: number, count: number, date: Date } } = {};

        history.forEach(entry => {
            const entryTime = entry.time instanceof Date ? entry.time : new Date(entry.time);
            const dateKey = entryTime.toISOString().split('T')[0]; // YYYY-MM-DD (UTC)

            if (!aggregates[dateKey]) {
                aggregates[dateKey] = { sum: 0, count: 0, date: new Date(dateKey) };
            }

            const r = (type === GaugeChartType.yearly)
                ? Number(entry.ratioLast365Days)
                : Number(entry.ratioLast30Days);

            if (!Number.isFinite(r)) return;
            aggregates[dateKey].sum += r;
            aggregates[dateKey].count++;
        });

        return Object.keys(aggregates).map(k => ({
            time: aggregates[k].date,
            ratio: aggregates[k].sum / Math.max(1, aggregates[k].count),
        })).sort((a, b) => a.time.getTime() - b.time.getTime());
    }

    // Aggregate daily fees (UTC)
    function aggregateDailyFees(history: { time: Date | string, satsPerByte: number }[]): { time: Date, fee: number }[] {
        const aggregates: { [dateKey: string]: { sum: number, count: number, date: Date } } = {};
        history.forEach(entry => {
            const entryTime = entry.time instanceof Date ? entry.time : new Date(entry.time);
            const dateKey = entryTime.toISOString().split('T')[0];
            if (!aggregates[dateKey]) {
                aggregates[dateKey] = { sum: 0, count: 0, date: new Date(dateKey) };
            }
            const val = Number(entry.satsPerByte);
            if (!Number.isFinite(val)) return;
            aggregates[dateKey].sum += val;
            aggregates[dateKey].count++;
        });
        return Object.keys(aggregates).map(k => ({
            time: aggregates[k].date,
            fee: aggregates[k].sum / Math.max(1, aggregates[k].count),
        })).sort((a, b) => a.time.getTime() - b.time.getTime());
    }

    // Window series to last 365 days or last 30 days
    function windowSeries(series: { time: Date, ratio: number }[], type: GaugeChartType): number[] {
        const now = new Date();
        const days = type === GaugeChartType.yearly ? 365 : 30;
        const cutoff = new Date(now.getTime() - days * 24 * 60 * 60 * 1000);
        return series.filter(p => p.time >= cutoff).map(p => p.ratio);
    }
    function windowFeeSeries(series: { time: Date, fee: number }[], type: GaugeChartType): number[] {
        const now = new Date();
        const days = type === GaugeChartType.yearly ? 365 : 30;
        const cutoff = new Date(now.getTime() - days * 24 * 60 * 60 * 1000);
        return series.filter(p => p.time >= cutoff).map(p => p.fee);
    }

    // Percentile rank (<= x) in percent [0,100]
    function percentileRank(values: number[], x: number): number {
        if (!values.length) return 0;
        const k = values.filter(v => v <= x).length;
        return (k / values.length) * 100;
    }

    // Compute p-quantile (0..1) with linear interpolation
    function quantile(values: number[], p: number): number {
        if (!values.length) return NaN;
        const arr = [...values].sort((a, b) => a - b);
        const idx = (arr.length - 1) * Math.min(1, Math.max(0, p));
        const lo = Math.floor(idx);
        const hi = Math.ceil(idx);
        if (lo === hi) return arr[lo];
        const t = idx - lo;
        return arr[lo] * (1 - t) + arr[hi] * t;
    }

    // Winsorize array by clamping to [qLow, qHigh]
    function winsorize(values: number[], lowP = 0.01, highP = 0.99): { data: number[], qLow: number, qHigh: number } {
        if (!values.length) return { data: [], qLow: NaN, qHigh: NaN };
        const qLow = quantile(values, lowP);
        const qHigh = quantile(values, highP);
        const data = values.map(v => Math.min(qHigh, Math.max(qLow, v)));
        return { data, qLow, qHigh };
    }

    // Percentage of observations greater than x
    function percentHigher(values: number[], x: number): number {
        if (!values.length) return 0;
        const k = values.filter(v => v > x).length;
        return (k / values.length) * 100;
    }

    // 10 descriptive labels based on absolute multiple R around 1.0
    type Category =
        | "extremely low"
        | "very low"
        | "low"
        | "moderately low"
        | "slightly below average"
        | "slightly above average"
        | "moderately high"
        | "high"
        | "very high"
        | "extremely high";

    function categorizeAbsolute10(R: number): Category {
        if (R < 0.4) return "extremely low";
        if (R < 0.6) return "very low";
        if (R < 0.8) return "low";
        if (R < 0.9) return "moderately low";
        if (R < 1.0) return "slightly below average";
        if (R < 1.1) return "slightly above average";
        if (R < 1.25) return "moderately high";
        if (R < 1.5) return "high";
        if (R < 2.0) return "very high";
        return "extremely high";
    }

    // Build series and window it to the selected horizon
    const dailyRatios = aggregateDailyRatios(feeIndexHistoryLastYear, gaugeChartType);
    const windowedRatios = windowSeries(dailyRatios, gaugeChartType);
    const dailyFees = aggregateDailyFees(feeEstimateHistoryLastYear || []);
    const windowedFees = windowFeeSeries(dailyFees, gaugeChartType);

    const R_today_raw = Number(currentFeeIndex);
    const { data: ratiosWins, qLow: rLow, qHigh: rHigh } = winsorize(windowedRatios);
    const R_today = Math.min(rHigh ?? R_today_raw, Math.max(rLow ?? R_today_raw, R_today_raw));

    const gaugePercentile = percentileRank(ratiosWins, R_today); // 0..100
    const higherPct = percentHigher(ratiosWins, R_today);

    const { data: feesWins, qLow: fLow, qHigh: fHigh } = winsorize(windowedFees);
    const feeTodayRaw = Number(currentFeeSatsPerVb);
    const feeToday = Math.min(fHigh ?? feeTodayRaw, Math.max(fLow ?? feeTodayRaw, feeTodayRaw));
    const rawFeeHigherPct = percentHigher(feesWins, feeToday);

    // Percentile-based labels using two-bucket scheme (<=1, >1)
    function categorizeByTwoBucketPercentile(R: number, S: number[]): Category {
        if (!S.length || !Number.isFinite(R)) return "slightly below average";
        const S_low = S.filter(v => v <= 1);
        const S_high = S.filter(v => v > 1);

        if (R <= 1 && S_low.length >= 10) {
            const p = percentileRank(S_low, R);
            if (p < 20) return "extremely low";
            if (p < 40) return "very low";
            if (p < 60) return "low";
            if (p < 80) return "moderately low";
            return "slightly below average";
        }
        if (R > 1 && S_high.length >= 10) {
            const p = percentileRank(S_high, R);
            if (p < 20) return "slightly above average";
            if (p < 40) return "moderately high";
            if (p < 60) return "high";
            if (p < 80) return "very high";
            return "extremely high";
        }
        // Fallbacks when insufficient samples per side
        return R <= 1 ? "slightly below average" : "slightly above average";
    }

    const currentCategory: Category = categorizeByTwoBucketPercentile(R_today, ratiosWins);

    function getScaleValues(): number[] { return Array.from({ length: 11 }, (_, i) => i * 10); }
    function getTicks(values: number[]): Tick[] {
        return values.map(value => ({
            value,
            valueConfig: { maxDecimalDigits: 0, hide: false }
        }));
    }
    function getSubArcs(values: number[]): SubArc[] {
        return values.map(value => ({ limit: value })) as SubArc[];
    }

    const pointerProps: PointerProps = {
        type: "needle",
        color: "rgba(180,180,180,0.85)",
        baseColor: "rgba(190,190,190,1)",
        animate: true,
    };

    const scaleValues = getScaleValues();
    const subArcs = getSubArcs(scaleValues);
    const tickValues = getTicks(scaleValues);
    const minValue = 0;
    const maxValue = 100;
    const fontFamily = 'Helvetica, sans-serif';

    const arc: Arc = {
        width: 0.15,
        colorArray: [
            "rgb(0, 255, 0)",
            "rgb(255, 255, 0)",
            "rgb(255, 0, 0)"
        ],
        subArcs,
        cornerRadius: 1,
    };

    const chartId = gaugeChartType === GaugeChartType.yearly ? "gaugeChartContainerYearly" : "gaugeChartContainerMonthly";
    const gaugeProps: GaugeComponentProps = {
        id: chartId,
        value: gaugePercentile,
        minValue,
        maxValue,
        type: GaugeType.Radial,
        pointer: pointerProps,
        labels: {
            valueLabel: {
                style: {
                    fontSize: "24px",
                    fontFamily: fontFamily,
                    backgroundColor: "rgb(255,255,255)"
                },
                matchColorWithArc: true,
                maxDecimalDigits: 0,
                formatTextValue: () => currentCategory,
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
        arc,
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
        const chartContainer = document.getElementById(chartId);
        if (chartContainer) {
            const svg = chartContainer.querySelector('svg');
            if (svg) {
                addAdditionalLabel(svg, "fees are", "50%", "77.5%");
            }
        }
    }, [currentFeeIndex, feeIndexHistoryLastYear, feeEstimateHistoryLastYear, gaugeChartType]);

    return (
        <>
            <p style={{ paddingTop: "0px", paddingBottom: "0vh", textAlign: "center" }}>
                Multiple R={R_today.toFixed(2)}. Higher than {higherPct.toFixed(2)}% of the last {gaugeChartType === GaugeChartType.yearly ? "365 days" : "30 days"}. Raw fee higher than {rawFeeHigherPct.toFixed(2)}%.
            </p>
            <GaugeComponent {...gaugeProps} />
        </>
    );
};

export default GaugeChart;
