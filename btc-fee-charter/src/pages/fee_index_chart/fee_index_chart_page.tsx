import React, { useEffect, useState } from 'react';
import LineChart from "../../components/charts/line_chart/line_chart";
import LiveIndexBanner from '../../components/live_index_banner/live_index_banner';
import CircularProgressIndicator from '../../components/loader/loader';
import { ChartType } from '../../chart_data/interface';
import { DataOp } from '../../chart_data/data_op';
import { ChartTimescale, TimeRange } from '../../chart_data/chart_timescale';
import { TEN_MINUTES_MS } from '../../lib/time';
import { ChartDatasetOp } from '../../chart_data/chart_dataset_op';
import { FeeIndex } from '../../store/interface';

const FeeIndexChartPage = ({ refreshTrigger }) => {
    const refreshThresholdInMs = TEN_MINUTES_MS;
    const feeIndexDataStartDateInWatcher = new Date('2021-05-23T00:00:00Z');

    const dataOp = new DataOp();
    const chartDatasetOp = new ChartDatasetOp();

    const [selectedRange, setSelectedRange] = useState(TimeRange.Last1Year);
    const [chartData, setChartData] = useState([]);
    const [lastUpdatedAt, setLastUpdatedAt] = useState(new Date().toLocaleString());
    const [feeHistory, setFeeHistory] = useState<FeeIndex[] | null>(null);

    async function handleDataFetch(since: Date): Promise<FeeIndex[] | Error> {
        try {
            const data = await dataOp.fetchFeeIndexHistory(since);
            if (data instanceof Error) return Error(`Error fetching fee index history from server: ${data}`);
            return data;
        } catch (error) {
            return Error(`Error handling fee index history fetch and storage: ${error}`);
        }
    };

    const [loading, setLoading] = useState(true);
    const [errorLoading, setErrorLoading] = useState(false);
    let [requiredHistoryStartTime, requiredHistoryEndTime] = ChartTimescale.getStartEndTimestampsFromTimerangeAsDate(selectedRange);

    const setData = async () => {
        try {
            setLoading(true);

            const data = await handleDataFetch(requiredHistoryStartTime);
            if (data instanceof Error) {
                throw new Error(`Error reading fee index history from store: ${data}`);
            }

            const chartData = chartDatasetOp.getFromData(data, ChartType.feeIndex);
            if (chartData instanceof Error) {
                throw chartData;
            }

            setChartData(chartData as any);
            setLastUpdatedAt(new Date().toLocaleString())

            if (selectedRange === TimeRange.Last1Year) {
                setFeeHistory(data);
            } else {
                setFeeHistory(null);
            }

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
                    <LiveIndexBanner feeHistory={selectedRange === TimeRange.Last1Year ? feeHistory ?? undefined: undefined} />
                    <LineChart dataset={chartData} chartType={ChartType.feeIndex} selectedRange={selectedRange} setSelectedRange={setSelectedRange} />
                    <p style={{ textAlign: "end", marginTop: "0px", paddingRight: "30px", color: "gray" }}>Last updated: {lastUpdatedAt}</p>
                </>
            )}
        </div>
    );
};

export default FeeIndexChartPage;
