import React from 'react';
import { ChartTimescale, TimeRange } from '../../chart_data/chart_timescale';
import { LokiStore } from '../../store/lokijs_store';
import { ChartType } from '../../chart_data/interface';
import { FeeIndex } from '../../store/interface';

// Props might include the data it needs to display
const LiveIndexBanner = ({ currentFeeIndex, feeIndexHistoryLastYear }) => {

    function getIndexPercentageHigher(currentFeeIndex: FeeIndex, feeIndexHistoryLastYear: FeeIndex[]): string {
        console.log(currentFeeIndex, feeIndexHistoryLastYear);

        const percentageHigherLastYear = (feeIndexHistoryLastYear.filter(index => index.ratioLast365Days > currentFeeIndex.ratioLast365Days).length / feeIndexHistoryLastYear.length) * 100;

        return `The current fee index has been higher ${percentageHigherLastYear.toFixed(2)}% of the time during the last year.`;
    }

    return (
        <>
            <h1 style={{ paddingTop: "10vh", textAlign: "center" }}>Fee Estimate Index</h1>
            <div style={{ display: "flex", flexDirection: "column", alignItems: "center", paddingTop: "10px" }}>
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
                <div style={{ textAlign: "center", paddingTop: "0px" }}>
                    <h3 style={{ fontSize: "20px" }}> at {new Date(currentFeeIndex.time).toLocaleString('en-US', {
                        year: 'numeric',
                        month: 'numeric',
                        day: 'numeric',
                        hour: 'numeric',
                        minute: 'numeric',
                        second: 'numeric',
                        hour12: true
                    })}</h3>
                </div>
            </div>
            <h3 style={{ paddingTop: "10px", paddingBottom: "0vh", textAlign: "center" }}>
                {getIndexPercentageHigher(currentFeeIndex, feeIndexHistoryLastYear)}
            </h3>
        </>
    );
};

export default LiveIndexBanner;
