import React, { useEffect, useState, useRef } from 'react';
import LineChart from "../../components/charts/line_chart/line_chart";
import CircularProgressIndicator from '../../components/loader/loader';
import { ChartType } from '../../chart_data/interface';
import { DataOp } from '../../chart_data/data_op';
import { ChartDatasetOp } from '../../chart_data/chart_dataset_op';
import { LokiStore } from '../../store/lokijs_store';
import { ChartTimescale, TimeRange } from '../../chart_data/chart_timescale';
import { FeeEstimate } from '../../store/interface';
import { ONE_MINUTE_MS, } from '../../lib/time';

const FeeEstimateChartPage = ({ refreshTrigger }) => {

    const refreshThresholdInMs = ONE_MINUTE_MS;
    const feeEstimateDataStartDateInWatcher = new Date('2020-05-23T00:00:00Z');

    const dataOp = new DataOp();
    const chartDatasetOp = new ChartDatasetOp();
    const store = new LokiStore();

    const [selectedRange, setSelectedRange] = useState(TimeRange.Last1Year);
    const [chartData, setChartData] = useState([]);
    const [lastUpdatedAt, setLastUpdatedAt] = useState(new Date().toLocaleString());

    async function handleDataFetchAndStore(since: Date): Promise<boolean | Error> {
        try {
            const data = await dataOp.fetchFeeEstimateHistory(since);
            if (data instanceof Error) return Error(`Error fetching fee estimate history from server: ${data}`);
            const isStored = await store.upsert(ChartType.feeEstimate, data);
            if (isStored instanceof Error) return Error(`Erroing storing fetched fee estimate history: ${isStored}`);
            return true;
        } catch (error) {
            return Error(`Error handling fee estimate history fetch and storage: ${error}`);
        }
    };

    const [loading, setLoading] = useState(true);
    const [errorLoading, setErrorLoading] = useState(false);
    let [requiredHistoryStartTime, requiredHistoryEndTime] = ChartTimescale.getStartEndTimestampsFromTimerangeAsDate(selectedRange);
    let availableHistoryStartTime: Date | Error;
    let availableHistoryEndTime: Date | Error;

    const setData = async () => {
        try {
            setLoading(true);

            if (requiredHistoryStartTime < feeEstimateDataStartDateInWatcher) {
                requiredHistoryStartTime = feeEstimateDataStartDateInWatcher;
            }

            availableHistoryStartTime = await store.getHistoryStartTime(ChartType.feeEstimate);
            if (availableHistoryStartTime instanceof Error || !availableHistoryStartTime) {
                availableHistoryStartTime = new Date();
            }

            availableHistoryEndTime = await store.getHistoryEndTime(ChartType.feeEstimate);
            if (availableHistoryEndTime instanceof Error || !availableHistoryEndTime) {
                availableHistoryEndTime = new Date("1900-01-01");
            }

            //if available data is not old enough:
            if (availableHistoryStartTime > requiredHistoryStartTime) {
               
                const isUpdated = await handleDataFetchAndStore(requiredHistoryStartTime);
                if (isUpdated instanceof Error) {
                    throw (isUpdated);
                }
            }

            //if avilable data is not new enough:
            else if (availableHistoryEndTime.getTime() + refreshThresholdInMs < requiredHistoryEndTime.getTime()) {
               

                const isUpdated = await handleDataFetchAndStore(availableHistoryEndTime);
                if (isUpdated instanceof Error) {
                    console.error(`Failed to refresh fee estimate history: ${isUpdated}`);
                    return;
                }
            }

            const data = await store.readMany(ChartType.feeEstimate, requiredHistoryStartTime, requiredHistoryEndTime);

            if (data instanceof Error) {
                throw new Error(`Error reading fee estimate history from store: ${data}`);
            }
            const chartData = chartDatasetOp.getFromData(data, ChartType.feeEstimate);
            if (chartData instanceof Error) {
                throw chartData;
            }

            setChartData(chartData as any);

            setLastUpdatedAt(new Date().toLocaleString())
        } catch (error) {
            console.error('Error setting fee estimate chart data:', error);
            setErrorLoading(true);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        setData();
    }, [selectedRange, refreshTrigger]);

    return (
        <div>
            {loading && <CircularProgressIndicator />}
            {!loading && errorLoading && <div>Error loading data. Please try again later.</div>}
            {!loading && !errorLoading && chartData && (
                <>
                    <LineChart dataset={chartData} chartType={ChartType.feeEstimate} selectedRange={selectedRange} setSelectedRange={setSelectedRange} />
                    <p style={{ textAlign: "end", marginTop: "0px", paddingRight: "30px", color: "gray" }}>Last updated: {lastUpdatedAt}</p>
                </>
            )}
        </div>
    );
};

export default FeeEstimateChartPage;
