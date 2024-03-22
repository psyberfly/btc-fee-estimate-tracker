import React from 'react';
import { ChartTimescale, TimeRange } from '../../chart_data/chart_timescale';
import { LokiStore } from '../../store/lokijs_store';
import { ChartType } from '../../chart_data/interface';
import { FeeIndex } from '../../store/interface';

const LiveIndexBanner = ({ currentFeeIndex, feeIndexHistoryLastYear }) => {



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
            aggregates[dateKey].sum365 += entry.ratioLast365Days;
            aggregates[dateKey].sum30 += entry.ratioLast30Days;
            aggregates[dateKey].count++;
        });

        // Convert the aggregates object into an array of FeeIndex
        return Object.keys(aggregates).map(date => ({
            time: new Date(date),
            ratioLast365Days: aggregates[date].sum365 / aggregates[date].count,
            ratioLast30Days: aggregates[date].sum30 / aggregates[date].count,
        }));
    }

    function getIndexPercentageDiff(currentFeeIndex: FeeIndex, feeIndexHistoryLastYear: FeeIndex[]): string {
        const aggregatedHistory = aggregateByDay(feeIndexHistoryLastYear);

        if (currentFeeIndex.ratioLast365Days > 1) {
            const percentageHigherLastYear = (aggregatedHistory.filter(index => index.ratioLast365Days > currentFeeIndex.ratioLast365Days).length / aggregatedHistory.length) * 100;
            const percentageHigherLastMonth = (aggregatedHistory.filter(index => index.ratioLast30Days > currentFeeIndex.ratioLast30Days).length / aggregatedHistory.length) * 100;
            return `The fee estimate index has been higher ${percentageHigherLastYear.toFixed(2)}% of the time last year and ${percentageHigherLastMonth.toFixed(2)}%. of the time last month`;
        } else {
            const percentageLowerLastYear = (aggregatedHistory.filter(index => index.ratioLast365Days < currentFeeIndex.ratioLast365Days).length / aggregatedHistory.length) * 100;
            const percentageLowerLastMonth = (aggregatedHistory.filter(index => index.ratioLast30Days < currentFeeIndex.ratioLast30Days).length / aggregatedHistory.length) * 100;

            return `The fee estimate index has been lower ${percentageLowerLastYear.toFixed(2)}% of the time last year and ${percentageLowerLastMonth.toFixed(2)}% of the time last month.`;
        }
    }


    return (
        <>
            <h1 style={{ textAlign: "center" }}>Bitcoin Fee Estimate Index</h1>
            {/* <p style={{ textAlign: "center",}}>This index mesaures how expensive the current Bitcoin fee estimate is against the yearly average. Fee estimates taken from mempool.space - 1-2 blocks/fastest. </p> */}
            <div style={{ display: "flex", flexDirection: "column", alignItems: "center", paddingTop: "0px" }}>
                <div style={{ display: "flex", justifyContent: "center", alignItems: "baseline" }}>
                    <div style={{ textAlign: "center", paddingRight: "50px" }}>
                        <h2>Last 365 Days</h2>
                        <h2 style={{ fontSize: "30px" }}>{Number(currentFeeIndex.ratioLast365Days).toFixed(2)}</h2>
                    </div>
                    <div style={{ textAlign: "center", paddingLeft: "50px" }}>
                        <h2>Last 30 Days</h2>
                        <h2 style={{ fontSize: "30px" }}>{Number(currentFeeIndex.ratioLast30Days).toFixed(2)}</h2>
                    </div>
                </div>
                {/* <div style={{ textAlign: "center", paddingTop: "0px" }}> */}
                {/* <p> at {new Date(currentFeeIndex.time).toLocaleString('en-US', {
                        year: 'numeric',
                        month: 'numeric',
                        day: 'numeric',
                        hour: 'numeric',
                        minute: 'numeric',
                        second: 'numeric',
                        hour12: true
                    })}</p> */}
                {/* </div> */}
            </div>
            <p style={{ paddingTop: "0px", paddingBottom: "0vh", textAlign: "center" }}>
                {getIndexPercentageDiff(currentFeeIndex, feeIndexHistoryLastYear)}
            </p>
        </>
    );
};

export default LiveIndexBanner;
