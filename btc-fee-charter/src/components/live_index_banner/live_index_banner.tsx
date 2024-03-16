import React from 'react';

// Props might include the data it needs to display
const LiveIndexBanner = ({ currentFeeIndex }) => {
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
            <h3 style={{ paddingTop: "10px", paddingBottom: "10vh", textAlign: "center" }}>
                The current fee estimate is {Math.abs((Number(currentFeeIndex.ratioLast365Days) - 1) * 100).toFixed(2)}%
                {' '}
                <span style={{ color: Number(currentFeeIndex.ratioLast365Days) >= 1 ? 'red' : 'green' }}>
                    {Number(currentFeeIndex.ratioLast365Days) >= 1 ? 'more' : 'less'}
                </span>
                {' '} than last year and {Math.abs((Number(currentFeeIndex.ratioLast30Days) - 1) * 100).toFixed(2)}%
                {' '}
                <span style={{ color: Number(currentFeeIndex.ratioLast30Days) >= 1 ? 'red' : 'green' }}>
                    {Number(currentFeeIndex.ratioLast30Days) >= 1 ? 'more' : 'less'}
                </span>
                {' '} than last month.
            </h3>
        </>
    );
};

export default LiveIndexBanner;
