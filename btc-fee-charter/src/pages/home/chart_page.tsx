// import React, { useState, useRef, useEffect } from "react";
// import { ChartDatasetOp } from "../../chart_data/chart_dataset_op";
// import { TimeRange, ChartTimescale } from "../../chart_data/chart_timescale";
// import { DataOp } from "../../chart_data/data_op";
// import { ChartType, IndexDetailed } from "../../chart_data/interface";
// import { ONE_MINUTE_MS, TEN_MINUTES_MS } from "../../lib/time";
// // import { DexieStore } from "../../store/dexie_store";
// import LineChart from "./components/charts/line_chart/line_chart";
// import { useParams } from 'react-router-dom';
// import { LokiStore } from "../../store/lokijs_store";
// import LiveIndexBanner from "./components/live_index_banner/live_index_banner";
// import CircularProgressIndicator from "../../components/loader/loader";
// import { FeeEstimate, FeeIndex, MovingAverage } from "../../store/interface";
// import GaugeChart from "./components/charts/gauge_chart/gauge_chart";

// let _feeIndexHistoryLastYearBackup: FeeIndex[] = [];
// let _currentFeeIndexBackup: FeeIndex = { time: new Date(), ratioLast30Days: -1, ratioLast365Days: -1, };
// let _currentFeeEstimateBackup: FeeEstimate = {
//     time: new Date(),
//     satsPerByte: -1
// };
// let _currentFeeAverageBackup: MovingAverage = {
//     time: new Date(),
//     last365Days: -1,
//     last30Days: -1
// };


// let _currentIntervalId;
// const ChartPage = () => {

//     // Ref to track the scrollable content div's scroll position
//     const scrollableContentRef = useRef(null);
//     const scrollPositionRef = useRef(0); // Ref to remember the scroll position
//     let data: [] = [];

//     const getChartTypeFromParams = (): ChartType => {
//         let chartTypeKey = useParams()["chartType"] as string;

//         if (!chartTypeKey) {
//             chartTypeKey = "index";
//         }

//         switch (chartTypeKey) {
//             case 'index':
//                 return ChartType.feeIndex;
//             case 'movingAverage':
//                 return ChartType.movingAverage;
//             case 'feeEstimate':
//                 return ChartType.feeEstimate;
//             default:
//                 console.error(`Invalid chart type: ${chartTypeKey}. Setting to default:index`);
//                 return ChartType.feeIndex;
//         }

//     };

//     const handleDataFetchAndStore = async (type: ChartType, startTime: Date) => {
//         try {
//             const data = await fetchDataByChartType(type, startTime);
//             if (data instanceof Error) throw new Error('Failed to fetch data');
//             const stored = await store.upsert(type, data);
//             if (stored instanceof Error) throw new Error('Failed to store data');
//             //  _dataBackup = [...data] as any;
//             return data;
//         } catch (error) {
//             console.error(`Error handling data for ${type}:`, error);
//             setErrorLoading(prev => ({ ...prev, [chartType]: true }));
//         }
//     };

//     const fetchDataByChartType = async (chartType: ChartType, sinceTime: Date): Promise<any | Error> => {
//         let data;
//         switch (chartType) {
//             case ChartType.feeIndex:
//                 data = await dataOp.fetchFeeIndexHistory(sinceTime);
//                 break;
//             case ChartType.movingAverage:
//                 data = await dataOp.fetchMovingAverageHistory(sinceTime);
//                 break;
//             case ChartType.feeEstimate:
//                 data = await dataOp.fetchFeeEstimateHistory(sinceTime);
//                 break;
//             default:
//                 throw new Error('Invalid chart type');
//         }

//         return data;
//     }

//     async function getFeeIndexHistoryLastYear(): Promise<FeeIndex[]> {
//         const [requiredHistoryStart, requiredHistoryEnd] = ChartTimescale.getStartEndTimestampsFromTimerange(TimeRange.Last1Year);
//         const requiredHistoryStartTime = new Date(requiredHistoryStart);
//         const requiredHistoryEndTime = new Date(requiredHistoryEnd);

//         const historyLastYear = await store.readMany(ChartType.feeIndex, requiredHistoryStartTime, requiredHistoryEndTime);

//         return historyLastYear as FeeIndex[];

//     }

//     async function getLatestFeeIndexDetailed(): Promise<IndexDetailed | Error> {
//         const res = await dataOp.fetchIndexDetailed();
//         if (res instanceof Error) {
//             console.error(`Error fetching latest index detailed: ${res}`);
//             return Error('Error fetching latest index detailed: ${res}');
//         }
//         return res;
//     };

//     const chartType = getChartTypeFromParams();
//     const [chartData, setChartData] = useState(null);
//     const [loading, setLoading] = useState({ [ChartType.feeIndex]: true });
//     const [errorLoading, setErrorLoading] = useState({ [ChartType.feeIndex]: false });
//     const dataOp = new DataOp();
//     const chartDataOp = new ChartDatasetOp();
//     // const store = new DexieStore();
//     const store = new LokiStore();
//     const [selectedRange, setSelectedRange] = useState(TimeRange.Last1Year); // Default 
//     const [currentFeeIndex, setCurrentFeeIndex] = useState(_currentFeeIndexBackup);
//     const [currentFeeAverage, setCurrentFeeAverage] = useState(_currentFeeAverageBackup);
//     const [currentFeeEstimate, setCurrentFeeEstimate] = useState(_currentFeeEstimateBackup);
//     const [feeIndexHistoryLastYear, setFeeIndexHistoryLastYear] = useState(_feeIndexHistoryLastYearBackup);
//     const intervalIdRef = useRef(null);

//     async function handleFetchAndSetData(isScheduled: boolean = false) {
//         let data: any[] = [];
//         const now = new Date().toLocaleTimeString();
//         setLoading(prev => ({ ...prev, [chartType]: true }));
//         const [requiredHistoryStart, requiredHistoryEnd] = ChartTimescale.getStartEndTimestampsFromTimerange(selectedRange);
//         const requiredHistoryStartTime = new Date(requiredHistoryStart);
//         const requiredHistoryEndTime = new Date(requiredHistoryEnd);


//         if (scrollableContentRef.current) {
//             scrollPositionRef.current = (scrollableContentRef.current as any).scrollTop;
//         }

//         let availableHistoryStartTime: Date;
//         let availableHistoryEndTime: Date = new Date();
//         const availableHistoryStart = await store.getHistoryStartTime(chartType);
//         if (availableHistoryStart instanceof Error || !availableHistoryStart) {
//             availableHistoryStartTime = new Date();
//         }
//         else {
//             availableHistoryStartTime = new Date(availableHistoryStart);
//         }
//         if (isScheduled) {
//             let availableHistoryEnd = await store.getHistoryEndTime(chartType);
//             if (!(availableHistoryEnd instanceof Error)) {
//                 availableHistoryEndTime = new Date(availableHistoryEnd);
//             }

//         }

//         try {
//             if (availableHistoryStartTime > requiredHistoryStartTime || isScheduled) {
//                 console.log("outdated data")
//                 data = [...await handleDataFetchAndStore(chartType, isScheduled ? availableHistoryEndTime : requiredHistoryStartTime)];
//                 if (!data) {
//                     console.error(`Error fetching data to home page: ${data}`);
//                     return;
//                 }
//                 //current fee multiple
//                 let currentFeeIndex = await store.readLatest(ChartType.feeIndex);
//                 if (currentFeeIndex instanceof Error || !currentFeeIndex) {
//                     console.log(`Error fetching latest fee index: ${currentFeeIndex}`);
//                     currentFeeIndex = _currentFeeIndexBackup;
//                 }
//                 setCurrentFeeIndex(currentFeeIndex);
//                 _currentFeeIndexBackup = currentFeeIndex;

//                 //fee multiple history last year
//                 let feeIndexHistoryLastYear = await getFeeIndexHistoryLastYear();
//                 if (feeIndexHistoryLastYear instanceof Error) {
//                     console.error(`Error fetching feeIndexHistoryLastyear: ${feeIndexHistoryLastYear}`);
//                     feeIndexHistoryLastYear = [..._feeIndexHistoryLastYearBackup];
//                 }
//                 setFeeIndexHistoryLastYear(feeIndexHistoryLastYear);
//                 _feeIndexHistoryLastYearBackup = [...feeIndexHistoryLastYear];


//             }

//             else {
//                 data = await store.readMany(chartType);
//             }

//             const latestIndexDetailed = await getLatestFeeIndexDetailed();

//             if (latestIndexDetailed instanceof Error) {
//                 return;
//             }

//             //current fee average

//             const latestFeeAverage = latestIndexDetailed.movingAverage;
//             setCurrentFeeAverage(latestFeeAverage as any);

//             //current fee est average
//             const latestFeeEstimate = latestIndexDetailed.currentFeeEstimate;

//             setCurrentFeeEstimate(latestFeeEstimate as any);
//             const chartDataset = chartDataOp.getFromData(data, chartType);
//             if (chartDataset instanceof Error) {
//                 console.error(`Error getting chart data from data: ${chartDataset}`)
//                 return;
//             }
//             setChartData(chartDataset as any);
//         } catch (error) {
//             console.error("Error setting data:", error);
//             setErrorLoading(prev => ({ ...prev, [chartType]: true }));
//         } finally {
//             setLoading(prev => ({ ...prev, [chartType]: false }));
//         }
//     };


//     useEffect(() => {
//         if (scrollableContentRef.current) {
//             (scrollableContentRef.current as any).scrollTop = scrollPositionRef.current;
//         }
//     }, [chartType]);

//     useEffect(() => {

//         handleFetchAndSetData();

//         if (!intervalIdRef.current) {
//             //Used to clear interval across browser navigation because component unmounts on first navigation and intervalRef.current becomes null;
//             clearInterval(_currentIntervalId);
//             intervalIdRef.current = setInterval(async () => {

//                 await handleFetchAndSetData(true);

//             }, TEN_MINUTES_MS) as any;

//             _currentIntervalId = intervalIdRef.current;
//             // console.log(`Data update scheduled with ID: ${intervalIdRef.current}`);

//         }

//         // return () => {
//         //     if (intervalIdRef.current) {
//         //         clearInterval(intervalIdRef.current);
//         //         console.log(`Interval cleared: ${intervalIdRef.current}`);
//         //     }
//         // }

//     }, [chartType, selectedRange]);  // Ensure these dependencies are stable to avoid frequent interval resets.

//     useEffect(() => {

//        handleFetchAndSetData();

//         if (!intervalIdRef.current) {
//             //Used to clear interval across browser navigation because component unmounts on first navigation and intervalRef.current becomes null;
//             clearInterval(_currentIntervalId);
//             intervalIdRef.current = setInterval(async () => {

//                 await handleFetchAndSetData(true);

//             }, TEN_MINUTES_MS) as any;

//             _currentIntervalId = intervalIdRef.current;
//             // console.log(`Data update scheduled with ID: ${intervalIdRef.current}`);

//         }

//         // return () => {
//         //     if (intervalIdRef.current) {
//         //         clearInterval(intervalIdRef.current);
//         //         console.log(`Interval cleared: ${intervalIdRef.current}`);
//         //     }
//         // }

//     }, [chartType, selectedRange]);  // Ensure these dependencies are stable to avoid frequent interval resets.


//     return (
//         <div className="scrollable-content" ref={scrollableContentRef}>
//             {loading[chartType] && (
//                 <CircularProgressIndicator />
//             )}
//             {!loading[chartType] && errorLoading[chartType] && (
//                 <div className="banner-error">Error loading data. Please try again later.</div>
//             )}
//             {!loading[chartType] && !errorLoading[chartType] && chartType === ChartType.feeIndex && chartData && (
//                 <>
//                     <LiveIndexBanner currentFeeIndex={currentFeeIndex} currentFeeAverage={currentFeeAverage} currentFeeEstimate={currentFeeEstimate} feeIndexHistoryLastYear={feeIndexHistoryLastYear} />

//                     <LineChart dataset={chartData} chartType={chartType} selectedRange={selectedRange} setSelectedRange={setSelectedRange} />
//                 </>
//             )}
//             {!loading[chartType] && !errorLoading[chartType] && chartType !== ChartType.feeIndex && chartData && (
//                 <LineChart dataset={chartData} chartType={chartType} selectedRange={selectedRange} setSelectedRange={setSelectedRange} />
//             )}
//         </div>
//     );

// };

// export default ChartPage;