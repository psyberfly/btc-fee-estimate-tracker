import { getFeeEstimateHistoryFromCsv } from "../lib/csv_parser/csv_parser";
import { handleError } from "../lib/errors/e";
import { ONE_DAY_MS, ONE_MINUTE_MS, TEN_MINUTES_MS } from "../lib/time/time";
import { FeeOp } from "../ops/fee_estimate/fee_estimate";
import { IndexOp } from "../ops/fee_index/fee_index";
import { MovingAverageOp } from "../ops/moving_average/moving_average";
import { AlertStreamServer } from "./ws";

export const indexWatchInterval = TEN_MINUTES_MS;
export const movingAverageWatchInterval = ONE_DAY_MS;

const movingAverageOp = new MovingAverageOp();
const feeOp = new FeeOp();
const indexOp = new IndexOp();

async function updateMovingAverage() {
  console.log("Updating Moving Average...");
  const today = new Date().toISOString();
  const isExistMovingAvgToday = await movingAverageOp.checkExists(today);

  if (!isExistMovingAvgToday) {
    console.log("Creating Moving Average for today...");
    const isMovingAvgCreated = await movingAverageOp.create();

    if (isMovingAvgCreated instanceof Error) {
      console.error("Error creating Moving Average!");
      return handleError(isMovingAvgCreated);
    }
  } else {
    console.log("Moving Average already exists for today.");
  }
  return true;
}

async function udpateAndBroadcastIndex(alertStreamServer: AlertStreamServer) {
  console.log("Updating latest Fee Estimate...");
  // fetch current fee estimate and update DB
  const currentFeeEstimate = await feeOp.updateCurrent();
  if (currentFeeEstimate instanceof Error) {
    console.error("Error updating Fee Estimate!");
    return handleError(currentFeeEstimate);
  }
  console.log("Fee Estimate updated.");
  console.log("Updating latest Index...");
  // calculate index and update DB
  const isIndexUpdated = await indexOp.updateIndex();

  if (isIndexUpdated instanceof Error) {
    console.error("Error updating Index!");
    return handleError(isIndexUpdated);
  }
  console.log("Index updated.");
  const latestIndex = await indexOp.readLatest();

  if (latestIndex instanceof Error) {
    return handleError(latestIndex);
  }
  console.log("Broadcasting Index alert...");

  const isAlertBroadcast = alertStreamServer.broadcastAlert(latestIndex);
  if (isAlertBroadcast instanceof Error) {
    console.error("Error broadcasting index alert!");
    return handleError(latestIndex);
  }
  console.log("Index alert broadcasted");
}

async function seedDb() {
  const csvFilePath = process.env.PATH_TO_CSV;

  const feeHistory = await getFeeEstimateHistoryFromCsv(csvFilePath);
  if (feeHistory instanceof Error) {
    console.error(
      `Error reading Fee Estimate history from .csv!: ${feeHistory}`,
    );
    return;
  }

  const isHistorySeeded = await feeOp.seedHistory(feeHistory);

  if (isHistorySeeded instanceof Error) {
    console.error(
      `Error seeding Fee Estimate history to DB!: ${isHistorySeeded}`,
    );
  } else {
    console.log("Fee Estimate History seeded from .csv.");
    return;
  }
}

export async function runIndexWatcher() {
  try {
    const port: string = process.env.WSS_PORT;
    const baseApiRoute = "/api/v1";
    const alertStreamServer = new AlertStreamServer(port, baseApiRoute);

    //At server start:
    await seedDb();
    //Calculate moving average once at onset, else fee index cant be computed until 24hours:
    await updateMovingAverage();
    //Calculate index once at onset
    await udpateAndBroadcastIndex(alertStreamServer);
    // every day:
    setInterval(async () => {
      await updateMovingAverage();
    }, movingAverageWatchInterval);

    // every 10 mins (block):
    setInterval(async () => {
      udpateAndBroadcastIndex(alertStreamServer);
    }, indexWatchInterval //change to ten mins for prod
    );
  } catch (error) {
    console.error("Error starting server:", error);
    process.exit(1);
  } finally {
    console.log("Index Watcher running...");
  }
}
