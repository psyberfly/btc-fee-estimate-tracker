import React, { useState, useRef, useEffect } from "react";
import { ChartDatasetOp } from "../../chart_data/chart_dataset_op";
import { TimeRange, ChartTimescale } from "../../chart_data/chart_timescale";
import { DataOp } from "../../chart_data/data_op";
import { ChartType } from "../../chart_data/interface";
import { TEN_MINUTES_MS } from "../../lib/time";
// import { DexieStore } from "../../store/dexie_store";
import LineChart from "./line_chart";
import { useParams } from 'react-router-dom';
import { LokiStore } from "../../store/lokijs_store";
import LiveIndexBanner from "../live_index_banner/live_index_banner";
import CircularProgressIndicator from "../loader/loader";
import { FeeIndex } from "../../store/interface";
import GaugeChart from "./gauge_chart";

let _feeIndexHistoryLastYearBackup: FeeIndex[] = [];
let _currentFeeIndexBackup: FeeIndex = { time: new Date(), ratioLast30Days: -1, ratioLast365Days: -1, };

const ChartPage = () => {

    // Ref to track the scrollable content div's scroll position
    const scrollableContentRef = useRef(null);
    const scrollPositionRef = useRef(0); // Ref to remember the scroll position

    const getChartTypeFromParams = (): ChartType => {
        let chartTypeKey = useParams()["chartType"] as string;

        if (!chartTypeKey) {
            chartTypeKey = "index";
        }

        switch (chartTypeKey) {
            case 'index':
                return ChartType.feeIndex;
            case 'movingAverage':
                return ChartType.movingAverage;
            case 'feeEstimate':
                return ChartType.feeEstimate;
            default:
                console.error(`Invalid chart type: ${chartTypeKey}. Setting to default:index`);
                return ChartType.feeIndex;
        }

    };

    const fetchData = async (chartType: ChartType, sinceTime: Date): Promise<any | Error> => {
        let data;
        switch (chartType) {
            case ChartType.feeIndex:
                data = await dataOp.fetchFeeIndexHistory(sinceTime);
                break;
            case ChartType.movingAverage:
                data = await dataOp.fetchMovingAverageHistory(sinceTime);
                break;
            case ChartType.feeEstimate:
                data = await dataOp.fetchFeeEstimateHistory(sinceTime);
                break;
            default:
                throw new Error('Invalid chart type');
        }

        return data;
    }

    async function getFeeIndexHistoryLastYear(): Promise<FeeIndex[]> {


        const [requiredHistoryStart, requiredHistoryEnd] = ChartTimescale.getStartEndTimestampsFromTimerange(TimeRange.Last1Year);
        const requiredHistoryStartTime = new Date(requiredHistoryStart);
        const requiredHistoryEndTime = new Date(requiredHistoryEnd);

        const historyLastYear = await store.readMany(ChartType.feeIndex, requiredHistoryStartTime, requiredHistoryEndTime);

        return historyLastYear as FeeIndex[];

    }

    const chartType = getChartTypeFromParams();
    const [chartData, setChartData] = useState(null);
    const [loading, setLoading] = useState({ [ChartType.feeIndex]: true });
    const [errorLoading, setErrorLoading] = useState({ [ChartType.feeIndex]: false });
    const dataOp = new DataOp();
    const chartDataOp = new ChartDatasetOp();
    // const store = new DexieStore();
    const store = new LokiStore();
    const [selectedRange, setSelectedRange] = useState(TimeRange.Last1Year); // Default 
    const [currentFeeIndex, setCurrentFeeIndex] = useState(_currentFeeIndexBackup);
    const [feeIndexHistoryLastYear, setFeeIndexHistoryLastYear] = useState(_feeIndexHistoryLastYearBackup);


    // Save and restore the scroll position
    useEffect(() => {
        if (scrollableContentRef.current) {
            (scrollableContentRef.current as any).scrollTop = scrollPositionRef.current;
        }
    }, [chartData]);

    const latestFeeIndex = async () => {
        const latestIndex = await store.readLatest(ChartType.feeIndex);
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
                if (scrollableContentRef.current) {
                    scrollPositionRef.current = (scrollableContentRef.current as any).scrollTop;
                }
                setLoading(prev => ({ ...prev, [chartType]: true }));
                let availableHistoryStartTime;
                const availableHistoryStart = await store.getHistoryStartTime(chartType);

                if (availableHistoryStart instanceof Error || !availableHistoryStart) {
                    availableHistoryStartTime = new Date();
                }
                else {
                    availableHistoryStartTime = new Date(availableHistoryStart);
                }

                const [requiredHistoryStart, requiredHistoryEnd] = ChartTimescale.getStartEndTimestampsFromTimerange(selectedRange);
                const requiredHistoryStartTime = new Date(requiredHistoryStart);
                const requiredHistoryEndTime = new Date(requiredHistoryEnd);

                let data;

                if (availableHistoryStartTime > requiredHistoryStartTime) {
                    data = await fetchData(chartType, requiredHistoryStartTime);

                    if (data instanceof Error) {
                        console.error(`Error fetching data from watcher! : ${data}`)
                        return;
                    }

                    const isDataStored = await store.upsert(chartType, data);

                    if (isDataStored instanceof Error) {
                        throw new Error(`Error storing data to DB: ${isDataStored}`);
                    }


                    if (chartType === ChartType.feeIndex) {
                        const currentFeeIndex = await latestFeeIndex();
                        if (currentFeeIndex instanceof Error || !currentFeeIndex) {
                            console.log(`Error fetching latest fee index: ${currentFeeIndex}`);
                            setCurrentFeeIndex({ ratioLast30Days: 0, ratioLast365Days: 0, time: new Date() });
                        }
                        else {
                            setCurrentFeeIndex(currentFeeIndex);
                        }
                        _currentFeeIndexBackup = currentFeeIndex;

                        const feeIndexHistoryLastYear = await getFeeIndexHistoryLastYear();

                        if (feeIndexHistoryLastYear instanceof Error) {
                            console.error(`Error fetching feeIndexHistoryLastyear: ${feeIndexHistoryLastYear} `);
                            throw (feeIndexHistoryLastYear);
                        }

                        setFeeIndexHistoryLastYear(feeIndexHistoryLastYear as any);
                        _feeIndexHistoryLastYearBackup = feeIndexHistoryLastYear;

                    }
                }

                const history = await store.readMany(chartType, requiredHistoryStartTime, requiredHistoryEndTime);
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
            const availableHistoryEndTime = await store.getHistoryEndTime(chartType);
            if (availableHistoryEndTime instanceof Error) {
                throw (availableHistoryEndTime);
            }

            const data = await fetchData(chartType, availableHistoryEndTime);

            if (data instanceof Error) {
                console.error(`Error fetching data from Watcher!: ${data}`);
                return;
            }

            const isDataStored = await store.upsert(chartType, data);

            if (isDataStored instanceof Error) {
                throw new Error(`Update data history: Error storing data to DB: ${isDataStored}`);
            }

            if (chartType === ChartType.feeIndex) {
                const currentFeeIndex = await latestFeeIndex()
                if (currentFeeIndex instanceof Error || !currentFeeIndex) {
                    console.log(`Error fetching latest fee index: ${currentFeeIndex}`);
                    setCurrentFeeIndex({ ratioLast30Days: 0, ratioLast365Days: 0, time: new Date() });
                }
                else {
                    setCurrentFeeIndex(currentFeeIndex);
                }
                _currentFeeIndexBackup = currentFeeIndex;

                const feeIndexHistoryLastYear = await getFeeIndexHistoryLastYear();

                if (feeIndexHistoryLastYear instanceof Error) {
                    console.error(`Error fetching feeIndexHistoryLastyear: ${feeIndexHistoryLastYear} `);
                    throw (feeIndexHistoryLastYear);
                }

                setFeeIndexHistoryLastYear(feeIndexHistoryLastYear as any);
                _feeIndexHistoryLastYearBackup = feeIndexHistoryLastYear;
            }

        }

        fetchDataForChartType(chartType);

        const intervalId = setInterval(() => {
            console.log("Updating history...")
            updateDataHistory(chartType);
            fetchDataForChartType(chartType);
        }, TEN_MINUTES_MS);
        return () => clearInterval(intervalId);
    }, [chartType, selectedRange]);

    return (
        <div className="scrollable-content" ref={scrollableContentRef}>
            {loading[chartType] && (
                <CircularProgressIndicator />
            )}
            {!loading[chartType] && errorLoading[chartType] && (
                <div className="banner-error">Error loading data. Please try again later.</div>
            )}
            {!loading[chartType] && !errorLoading[chartType] && chartType === ChartType.feeIndex && chartData && (
                <>
                    <LiveIndexBanner currentFeeIndex={currentFeeIndex} feeIndexHistoryLastYear={feeIndexHistoryLastYear} />
                    <div className="gauge-container">
                        <GaugeChart currentValue={currentFeeIndex.ratioLast365Days} feeIndexesLastYear={feeIndexHistoryLastYear} />
                    </div>
                    <LineChart dataset={chartData} chartType={chartType} selectedRange={selectedRange} setSelectedRange={setSelectedRange} />
                </>
            )}
            {!loading[chartType] && !errorLoading[chartType] && chartType !== ChartType.feeIndex && chartData && (
                <LineChart dataset={chartData} chartType={chartType} selectedRange={selectedRange} setSelectedRange={setSelectedRange} />
            )}
        </div>
    );

};

export default ChartPage;