import React from 'react';
import GaugeChart, { GaugeChartType } from '../charts/gauge_chart/gauge_chart';
import "./live_index_banner.css";
const LiveIndexBanner = ({ currentFeeIndex, currentFeeAverage, currentFeeEstimate, feeIndexHistoryLastYear }) => {


    return (
        <>
            <h1 style={{ textAlign: "center", fontWeight: 'normal' }}>Bull Bitcoin Fee Multiple</h1>

            <div className="live-index-banner">
                <div className="gauge-charts-container">
                    <div className="gauge-chart">
                        <h1>Last 365 Days</h1>
                        <h2>Fee Multiple: {Number(currentFeeIndex.ratioLast365Days).toFixed(2)}</h2>
                        <h3>Current Fee: {Number(currentFeeEstimate.satsPerByte).toFixed(2)} sats/vb</h3>
                        <h3>Average Fee: {Number(currentFeeAverage.last365Days).toFixed(2)} sats/vb</h3>

                        <div className="gauge-container">
                            <GaugeChart currentFeeIndex={currentFeeIndex.ratioLast365Days} feeIndexHistoryLastYear={feeIndexHistoryLastYear} gaugeChartType={GaugeChartType.yearly} />
                        </div>
                    </div>
                    <div className="gauge-chart">
                        <h1>Last 30 Days</h1>
                        <h2>Fee Multiple: {Number(currentFeeIndex.ratioLast30Days).toFixed(2)}</h2>
                        <h3>Current Fee: {Number(currentFeeEstimate.satsPerByte).toFixed(2)} sats/vb</h3>
                        <h3>Average Fee: {Number(currentFeeAverage.last30Days).toFixed(2)} sats/vb</h3>
                        <div className="gauge-container">
                            <GaugeChart currentFeeIndex={currentFeeIndex.ratioLast30Days} feeIndexHistoryLastYear={feeIndexHistoryLastYear} gaugeChartType={GaugeChartType.monthly} />
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
};

export default LiveIndexBanner;
