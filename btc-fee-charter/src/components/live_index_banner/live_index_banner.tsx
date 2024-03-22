import React from 'react';
import { ChartTimescale, TimeRange } from '../../chart_data/chart_timescale';
import { LokiStore } from '../../store/lokijs_store';
import { ChartType } from '../../chart_data/interface';
import { FeeIndex } from '../../store/interface';

const LiveIndexBanner = ({ currentFeeIndex, feeIndexHistoryLastYear }) => {


    function aggregateByDay(feeIndexHistory: FeeIndex[]): FeeIndex[] {
        const aggregates: {[key: string]: { sum: number, count: number }} = {};
        
        feeIndexHistory.forEach(entry => {
            const entryTime = entry.time instanceof Date ? entry.time : new Date(entry.time);
            const dateKey = entryTime.toISOString().split('T')[0]; //
            if (!aggregates[dateKey]) {
                aggregates[dateKey] = { sum: 0, count: 0 };
            }
            aggregates[dateKey].sum += entry.ratioLast365Days;
            aggregates[dateKey].count++;
        });
    
        return Object.keys(aggregates).map(date => ({
            time: new Date(date),
            ratioLast365Days: aggregates[date].sum / aggregates[date].count,
            ratioLast30Days: 0
        }));
    }

    function getIndexPercentageDiff(currentFeeIndex: FeeIndex, feeIndexHistoryLastYear: FeeIndex[]): string {
        const aggregatedHistory = aggregateByDay(feeIndexHistoryLastYear);
        
        if (currentFeeIndex.ratioLast365Days > 1) {
            const percentageHigherLastYear = (aggregatedHistory.filter(index => index.ratioLast365Days > currentFeeIndex.ratioLast365Days).length / aggregatedHistory.length) * 100;
            return `The fee estimate index has been higher ${percentageHigherLastYear.toFixed(2)}% of the time during the last year.`;
        } else {
            const percentageLowerLastYear = (aggregatedHistory.filter(index => index.ratioLast365Days < currentFeeIndex.ratioLast365Days).length / aggregatedHistory.length) * 100;
            return `The fee estimate index has been lower ${percentageLowerLastYear.toFixed(2)}% of the time during the last year.`;
        }
    }
    

    return (
        <>
            <h1 style={{ textAlign: "center" }}>Bitcoin Fee Estimate Index</h1>
            <p style={{ textAlign: "center",}}>This index mesaures how expensive the current Bitcoin fee estimate is against the yearly average. Fee estimates taken from mempool.space - 1-2 blocks/fastest. </p>
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
                    <p> at {new Date(currentFeeIndex.time).toLocaleString('en-US', {
                        year: 'numeric',
                        month: 'numeric',
                        day: 'numeric',
                        hour: 'numeric',
                        minute: 'numeric',
                        second: 'numeric',
                        hour12: true
                    })}</p>
                {/* </div> */}
            </div>
            <h3 style={{ paddingTop: "0px", paddingBottom: "0vh", textAlign: "center" }}>
                {getIndexPercentageDiff(currentFeeIndex, feeIndexHistoryLastYear)}
            </h3>
        </>
    );
};

export default LiveIndexBanner;
