import React, { useEffect, useState, useRef } from 'react';
import LineChart from "../../components/charts/line_chart/line_chart";
import LiveIndexBanner from '../../components/live_index_banner/live_index_banner';
import CircularProgressIndicator from '../../components/loader/loader';
import { ChartType} from '../../chart_data/interface';
import { DataOp } from '../../chart_data/data_op';
//import { LokiStore } from '../../store/lokijs_store';
import { ChartTimescale, TimeRange } from '../../chart_data/chart_timescale';
import { ONE_MINUTE_MS, TEN_MINUTES_MS } from '../../lib/time';
import { ChartDatasetOp } from '../../chart_data/chart_dataset_op';
import { FeeIndex } from '../../store/interface';

const FeeIndexChartPage = ({refreshTrigger}) => {

    const refreshThresholdInMs = TEN_MINUTES_MS;
    const feeIndexDataStartDateInWatcher = new Date('2021-05-23T00:00:00Z');

    const dataOp = new DataOp();
    const chartDatasetOp = new ChartDatasetOp();
   // const store = new LokiStore();

    const [selectedRange, setSelectedRange] = useState(TimeRange.Last1Year);
    const [chartData, setChartData] = useState([]);
    const [lastUpdatedAt, setLastUpdatedAt] = useState(new Date().toLocaleString());

    async function handleDataFetch(since: Date): Promise<FeeIndex[] | Error> {
        try {
            const data = await dataOp.fetchFeeIndexHistory(since);
            if (data instanceof Error) return Error(`Error fetching fee index history from server: ${data}`);
            //const isStored = await store.upsert(ChartType.feeIndex, data);
            //if (isStored instanceof Error) return Error(`Erroing storing fetched fee index history: ${isStored}`);
            return data;
        } catch (error) {
            return Error(`Error handling fee index history fetch and storage: ${error}`);
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

            // if (requiredHistoryStartTime < feeIndexDataStartDateInWatcher) {
            //     requiredHistoryStartTime = feeIndexDataStartDateInWatcher;
            // }

            // availableHistoryStartTime =  //await store.getHistoryStartTime(ChartType.feeIndex);
            // if (availableHistoryStartTime instanceof Error || !availableHistoryStartTime) {
            //     availableHistoryStartTime = new Date();
            // }

            // availableHistoryEndTime = await store.getHistoryEndTime(ChartType.feeIndex);
            // if (availableHistoryEndTime instanceof Error || !availableHistoryEndTime) {
            //     availableHistoryEndTime = new Date("1900-01-01");
            // }

            // //if available data is not old enough:
            // if (availableHistoryStartTime > requiredHistoryStartTime) {
            //     const isUpdated = await handleDataFetchAndStore(requiredHistoryStartTime);
            //     if (isUpdated instanceof Error) {
            //         throw (isUpdated);
            //     }
            // }

            // //if avilable data is not new enough:
            // else if (availableHistoryEndTime.getTime() + refreshThresholdInMs < requiredHistoryEndTime.getTime()) {
                
            //     const isUpdated = await handleDataFetchAndStore(availableHistoryEndTime);
            //     if (isUpdated instanceof Error) {
            //         console.error(`Failed to refresh fee index history: ${isUpdated}`);
            //         return;
            //     }
            // }

            const data = await handleDataFetch(requiredHistoryStartTime); //store.readMany(ChartType.feeIndex, requiredHistoryStartTime, requiredHistoryEndTime);

            if (data instanceof Error) {
                throw new Error(`Error reading fee index history from store: ${data}`);
            }
           
            const chartData = chartDatasetOp.getFromData(data, ChartType.feeIndex);
            if (chartData instanceof Error) {
                throw chartData;
            }

            setChartData(chartData as any);
            setLastUpdatedAt(new Date().toLocaleString())

        } catch (error) {
            console.error('Error setting fee index chart data:', error);
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
                    <LiveIndexBanner/>
                    <LineChart dataset={chartData} chartType={ChartType.feeIndex} selectedRange={selectedRange} setSelectedRange={setSelectedRange} />
                    <p style={{textAlign:"end", marginTop:"0px", paddingRight:"30px", color:"gray"}}>Last updated: {lastUpdatedAt}</p>
                </>
            )}
        </div>
    );
};

export default FeeIndexChartPage;
