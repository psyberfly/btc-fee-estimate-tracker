import React from 'react';
import GaugeChart, { GaugeChartType } from '../charts/gauge_chart/gauge_chart';
import "./live_index_banner.css";
const LiveIndexBanner = ({ currentFeeIndex, feeIndexHistoryLastYear }) => {


    return (
        <>
            <h1 style={{ textAlign: "center" }}>Bull Bitcoin Fee Multiple</h1>

            <div className="live-index-banner">
                <div className="gauge-charts-container">
                    <div className="gauge-chart">
                        <h1 style={{ fontSize: "32px", }}>Last 365 Days</h1>
                        <h2 style={{ fontSize: "30px" }}>{Number(currentFeeIndex.ratioLast365Days).toFixed(2)}</h2>
                        <div className="gauge-container">
                            <GaugeChart currentFeeIndex={currentFeeIndex.ratioLast365Days} feeIndexHistoryLastYear={feeIndexHistoryLastYear} gaugeChartType= {GaugeChartType.yearly} />
                        </div>
                    </div>
                    <div className="gauge-chart">
                        <h1 style={{ fontSize: "32px" }}>Last 30 Days</h1>
                        <h2 style={{ fontSize: "30px" }}>{Number(currentFeeIndex.ratioLast30Days).toFixed(2)}</h2>
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
