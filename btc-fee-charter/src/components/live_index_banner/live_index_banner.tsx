import React from 'react';
import { ChartTimescale, TimeRange } from '../../chart_data/chart_timescale';
import { LokiStore } from '../../store/lokijs_store';
import { ChartType } from '../../chart_data/interface';
import { FeeIndex } from '../../store/interface';

const LiveIndexBanner = ({ currentFeeIndex }) => {


    return (
        <>
            <h1 style={{ textAlign: "center" }}>Bull Bitcoin Fee Multiple</h1>

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

            </div>
           
        </>
    );
};

export default LiveIndexBanner;
