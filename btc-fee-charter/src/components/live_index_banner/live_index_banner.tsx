import React, { useEffect, useState } from 'react';
import GaugeChart, { GaugeChartType } from '../charts/gauge_chart/gauge_chart';
import { DataOp } from '../../chart_data/data_op';
//import { LokiStore } from '../../store/lokijs_store';
import "./live_index_banner.css";
import { ChartType } from '../../chart_data/interface';
import { FeeIndex } from '../../store/interface';
import CircularProgressIndicator from '../loader/loader';
import { ChartTimescale, TimeRange } from '../../chart_data/chart_timescale';

const LiveIndexBanner = ({}) => {

    const dataOp = new DataOp();
    //const store = new LokiStore();

    const [loading, setLoading] = useState(true);
    const [errorLoading, setErrorLoading] = useState(false);
    const [currentFeeEstimate, setCurrentFeeEstimate] = useState(null);
    const [currentFeeAverage, setCurrentFeeAverage] = useState(null);
    const [currentFeeIndex, setCurrentFeeIndex] = useState();
    const [feeIndexHistoryLastYear, setFeeIndexHistoryLastYear] = useState([]);
    const [requiredHistoryStartTime, requiredHistoryEndTime] = ChartTimescale.getStartEndTimestampsFromTimerangeAsDate(TimeRange.Last1Year);



    async function handleDataFetch(since: Date): Promise<FeeIndex[] | Error> {
        try {
            const data = await dataOp.fetchFeeIndexHistory(since);
            if (data instanceof Error) return Error(`Error fetching fee estimate history from server: ${data}`);
            //const isStored = await store.upsert(ChartType.feeEstimate, data);
            //if (isStored instanceof Error) return Error(`Erroing storing fetched fee estimate history: ${isStored}`);
            return data;
        } catch (error) {
            return Error(`Error handling fee estimate history fetch and storage: ${error}`);
        }
    };
    const setData = async () => {
        setLoading(true);
        try {
            const latestIndexDetailed = await dataOp.fetchIndexDetailed();
            if (latestIndexDetailed instanceof Error) {
                console.error(`Error fetching latest index detailed from API: ${latestIndexDetailed}`);
                setErrorLoading(true);
                return;
            }

            const latestFeeEstimate = latestIndexDetailed.currentFeeEstimate;
            setCurrentFeeEstimate(latestFeeEstimate as any);
            const latestFeeAverage = latestIndexDetailed.movingAverage;
            setCurrentFeeAverage(latestFeeAverage as any);
            const latestFeeIndex = {
                time: latestIndexDetailed.timestamp,
                ratioLast365Days: latestIndexDetailed.feeEstimateMovingAverageRatio.last365Days,
                ratioLast30Days: latestIndexDetailed.feeEstimateMovingAverageRatio.last30Days
            } as FeeIndex;
            setCurrentFeeIndex(latestFeeIndex as any);

            const oneYearAgo = new Date();
            oneYearAgo.setFullYear(oneYearAgo.getFullYear() - 1);
            const feeIndexHistoryLastYear = await handleDataFetch(oneYearAgo); //store.readMany(ChartType.feeIndex, requiredHistoryStartTime, requiredHistoryEndTime);
            if(feeIndexHistoryLastYear instanceof Error)
            {
                throw feeIndexHistoryLastYear;
            }
            setFeeIndexHistoryLastYear(feeIndexHistoryLastYear as []);

        } catch (error) {
            console.error('Error fetching data:', error);
            setErrorLoading(true);
            return;
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        setData();
    }, []);


    return (
        <>
            <h1 style={{ textAlign: "center", fontWeight: 'normal' }}>Bull Bitcoin Fee Multiple</h1>
            {loading && <CircularProgressIndicator />}
            {!loading && errorLoading && <div>Error loading data. Please try again later.</div>}
            {!loading && !errorLoading && currentFeeEstimate && currentFeeAverage && currentFeeIndex && (
                <div className="live-index-banner">
                    <div className="gauge-charts-container">
                        <div className="gauge-chart">
                            <h1>Last 365 Days</h1>
                            <h2>Fee Multiple: {Number((currentFeeIndex as any).ratioLast365Days).toFixed(2)}</h2>
                            <h3>Current Fee: {Number((currentFeeEstimate as any).satsPerByte).toFixed(2)} sats/vb</h3>
                            <h3>Average Fee: {Number((currentFeeAverage as any).last365Days).toFixed(2)} sats/vb</h3>

                            <div className="gauge-container">
                                <GaugeChart currentFeeIndex={(currentFeeIndex as any).ratioLast365Days} feeIndexHistoryLastYear={feeIndexHistoryLastYear} gaugeChartType={GaugeChartType.yearly} />
                            </div>
                        </div>
                        <div className="gauge-chart">
                            <h1>Last 30 Days</h1>
                            <h2>Fee Multiple: {Number((currentFeeIndex as any).ratioLast30Days).toFixed(2)}</h2>
                            <h3>Current Fee: {Number((currentFeeEstimate as any).satsPerByte).toFixed(2)} sats/vb</h3>
                            <h3>Average Fee: {Number((currentFeeAverage as any).last30Days).toFixed(2)} sats/vb</h3>
                            <div className="gauge-container">
                                <GaugeChart currentFeeIndex={(currentFeeIndex as any).ratioLast30Days} feeIndexHistoryLastYear={feeIndexHistoryLastYear} gaugeChartType={GaugeChartType.monthly} />
                            </div>
                        </div>
                    </div>
                </div>
            )} </>
    );
};

export default LiveIndexBanner;
