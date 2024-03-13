import React, { useState, useEffect } from "react";
import { ChartDatasetOp } from "../../chart_data/chart_dataset_op";
import { TimeRange, ChartTimescale } from "../../chart_data/chart_timescale";
import { DataOp } from "../../chart_data/data_op";
import { ServiceChartType } from "../../chart_data/interface";
import { TEN_MINUTES_MS } from "../../lib/time";
import { Store } from "../../store/store";
import ChartView from "./chart_view";
import { useParams } from 'react-router-dom';


const ChartPage = () => {

    const getChartTypeFromParams = (): ServiceChartType => {
        let chartTypeKey = useParams()["chartType"] as string;

        if (!chartTypeKey) {
            chartTypeKey = "index";
        }

        switch (chartTypeKey) {
            case 'index':
                return ServiceChartType.index;
            case 'movingAverage':
                return ServiceChartType.movingAverage;
            case 'feeEstimate':
                return ServiceChartType.feeEstimate;
            default:
                console.error(`Invalid chart type: ${chartTypeKey}. Setting to default:index`);
                return ServiceChartType.index;
        }

    };

    const chartType = getChartTypeFromParams();
    const [chartData, setChartData] = useState(null);
    const [loading, setLoading] = useState({ [ServiceChartType.index]: true });
    const [errorLoading, setErrorLoading] = useState({ [ServiceChartType.index]: false });
    const dataOp = new DataOp();
    const chartDataOp = new ChartDatasetOp();
    const store = new Store();
    const [selectedRange, setSelectedRange] = useState(TimeRange.Last1Month); // Default 
    const [currentFeeIndex, setCurrentFeeIndex] = useState({ ratioLast365Days: 0, ratioLast30Days: 0, time: new Date() });

    const latestFeeIndex = async () => {
        const latestIndex = await store.readLatest(ServiceChartType.index);
        if (latestFeeIndex instanceof Error || !latestFeeIndex) {
            console.log(`Error fetching latest fee index: ${latestFeeIndex}`);
        }
        else {
            return latestIndex;
        }
    };

    useEffect(() => {
        const fetchDataForChartType = async (chartType) => {
            try {

                setLoading(prev => ({ ...prev, [chartType]: true }));
                let data;

                //first read latest timestamp from DB
                const availableHistoryStartTimestamp = new Date(await store.historyStartTimestamp(chartType));
                const [requiredHistoryStart, requiredHistoryEnd] = ChartTimescale.getStartEndTimestampsFromTimerange(selectedRange);
                const requiredHistoryStartTimestamp = new Date(requiredHistoryStart);
                if (!availableHistoryStartTimestamp || isNaN(availableHistoryStartTimestamp.getTime()) || availableHistoryStartTimestamp > requiredHistoryStartTimestamp) {
                    //fetch the latest readings from watcher beyond latest timestamp
                    switch (chartType) {
                        case ServiceChartType.index:
                            data = await dataOp.fetchFeeIndexHistory(requiredHistoryStartTimestamp);
                            break;
                        case ServiceChartType.movingAverage:
                            data = await dataOp.fetchMovingAverageHistory(requiredHistoryStartTimestamp);
                            break;
                        case ServiceChartType.feeEstimate:
                            data = await dataOp.fetchFeeEstimateHistory(requiredHistoryStartTimestamp);
                            break;
                        default:
                            throw new Error('Invalid chart type');
                    }

                    if (data instanceof Error) {
                        console.error(`Error fetching data for ${chartType}`);
                        throw data;
                    }


                    const isDataStored = await store.upsert(chartType, data);

                    if (isDataStored instanceof Error) {
                        throw new Error(`Error storing data to DB: ${isDataStored}`);
                    }

                    const currentFeeIndex = await latestFeeIndex()
                    if (currentFeeIndex instanceof Error || !currentFeeIndex) {
                        console.log(`Error fetching latest fee index: ${currentFeeIndex}`);
                        setCurrentFeeIndex({ ratioLast30Days: 0, ratioLast365Days: 0, time: new Date() });
                    }
                    else {
                        setCurrentFeeIndex(currentFeeIndex);
                    }
                }

                const history = await store.read(chartType); //this could be upgraded to fetch data from db by selectedRange?
                const chartData = chartDataOp.getFromData(history, chartType);

                if (chartData instanceof Error) {
                    console.error(`Error getting chart dataset from data.`);
                    throw chartData;
                }

                setChartData(chartData as any);

            } catch (error) {
                console.error("Error setting data:", error);
                setErrorLoading(prev => ({ ...prev, [chartType]: true }));
            } finally {
                setLoading(prev => ({ ...prev, [chartType]: false }));
            }
        };


        const updateDataHistory = async (chartType) => {
            const availableHistoryEndTimestamp = new Date(await store.historyEndTimestamp(chartType));

            let data;
            switch (chartType) {
                case ServiceChartType.index:
                    data = await dataOp.fetchFeeIndexHistory(availableHistoryEndTimestamp);

                    break;
                case ServiceChartType.movingAverage:
                    data = await dataOp.fetchMovingAverageHistory(availableHistoryEndTimestamp);
                    break;
                case ServiceChartType.feeEstimate:
                    data = await dataOp.fetchFeeEstimateHistory(availableHistoryEndTimestamp);
                    break;
                default:
                    throw new Error('Invalid chart type');
            }

            if (data instanceof Error) {
                console.error(`Update data history: Error fetching data for ${chartType}`);
                throw data;
            }

            const isDataStored = await store.upsert(chartType, data);

            if (isDataStored instanceof Error) {
                throw new Error(`Update data history: Error storing data to DB: ${isDataStored}`);
            }
            const currentFeeIndex = await latestFeeIndex()
            if (currentFeeIndex instanceof Error || !currentFeeIndex) {
                console.log(`Error fetching latest fee index: ${currentFeeIndex}`);
                setCurrentFeeIndex({ ratioLast30Days: 0, ratioLast365Days: 0, time: new Date() });
            }
            else {
                setCurrentFeeIndex(currentFeeIndex);
            }
        }

        fetchDataForChartType(chartType);

        setInterval(() => {
            console.log("Updating history...")
            updateDataHistory(chartType);
            fetchDataForChartType(chartType);
        }, TEN_MINUTES_MS);

    }, [chartType, selectedRange]);


    return (

        <div className="scrollable-content">

            {chartType as any === ServiceChartType.index && chartData && (
                <>
                    <h1 style={{ paddingTop: "10vh", textAlign: "center" }}>Fee Estimate Index</h1>
                    <div style={{ display: "flex", flexDirection: "column", alignItems: "center", paddingTop: "10px" }}>
                        <div style={{ display: "flex", justifyContent: "center", alignItems: "baseline" }}>
                            {/* Container for ratios */}
                            <div style={{ textAlign: "center", paddingRight: "50px" }}>
                                <h2>Last 365 Days</h2>
                                <h2 style={{ fontSize: "30px" }}>{Number(currentFeeIndex.ratioLast365Days).toFixed(2)}</h2>
                            </div>
                            <div style={{ textAlign: "center", paddingLeft: "50px" }}>
                                <h2>Last 30 Days</h2>
                                <h2 style={{ fontSize: "30px" }}>{Number(currentFeeIndex.ratioLast30Days).toFixed(2)}</h2>
                            </div>
                        </div>
                        {/* Separate container for the date */}
                        <div style={{ textAlign: "center", paddingTop: "0px" }}> {/* Adjust spacing as needed */}
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
            )}
            {errorLoading[chartType!] ? (
                <div className="banner-error">Error loading data. Please try again later.</div>
            ) : loading[chartType!] ? (
                <div className="banner-loading">Loading...</div>
            ) : (
                <ChartView dataset={chartData} chartType={chartType} selectedRange={selectedRange} setSelectedRange={setSelectedRange} />
            )}

        </div >
    );

};

export default ChartPage;