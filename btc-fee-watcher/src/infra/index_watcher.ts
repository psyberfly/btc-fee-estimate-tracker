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

async function seedIndexes() {
  console.log("Seeding indexes since start date...");
  //unix time
  const seedIndexStartTimestamp: string =
    process.env.SEED_INDEX_SINCE_TIMESTAMP;
  const timestampNumber: number = parseInt(seedIndexStartTimestamp, 10);
  const seedIndexStartDate = new Date(timestampNumber);
  console.log("Seeding moving averages...");
  await movingAverageOp.seed(seedIndexStartDate);
  console.log("Seeding indexes...");
  await indexOp.seed(seedIndexStartDate);
}

async function scheduleMovingAverageUpdate() {
  // Calculate the time now
  const now = new Date();
  // Calculate the start of the next day
  const nextDay = new Date(
    now.getFullYear(),
    now.getMonth(),
    now.getDate() + 1,
  );
  // Calculate the delay until the start of the next day
  const delayUntilNextDay = nextDay.getTime() - now.getTime();

  // Schedule the updateMovingAverage to run at the start of the next day
  setTimeout(async () => {
    await updateMovingAverage();
    // After running, schedule the next execution
    scheduleMovingAverageUpdate();
  }, delayUntilNextDay);
}

async function updateMovingAverage() {
  try {
    console.log("Updating Moving Average...");
    const today = new Date();
    const isExistMovingAvgToday = await movingAverageOp.checkExists(
      today.toISOString(),
    );

    if (!isExistMovingAvgToday) {
      console.log("Creating Moving Average for today...");
      const isMovingAvgCreated = await movingAverageOp.create(today);

      if (isMovingAvgCreated instanceof Error) {
        console.error(`Error creating Moving Average!${isMovingAvgCreated}`);
        return handleError(isMovingAvgCreated);
      }
    } else {
      console.log("Moving Average already exists for today.");
    }
    return true;
  } catch (e) {
    throw e;
  }
}

async function updateAndBroadcastIndex(alertStreamServer: AlertStreamServer) {
  try {
    console.log("Updating latest Fee Estimate...");
    // fetch current fee estimate and update DB
    const currentFeeEstimate = await feeOp.create();
    if (currentFeeEstimate instanceof Error) {
      console.error("Error updating Fee Estimate!");
      return handleError(currentFeeEstimate);
    }
    console.log("Fee Estimate updated.");
    console.log("Updating latest Index...");
    // calculate index and update DB
    const isIndexUpdated = await indexOp.create(currentFeeEstimate);

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
  } catch (e) {
    throw e;
  }
}

async function seedHistory() {
  console.log("Seeding Fee Estimates history from .csv...");
  //Fee Estimate:
  //csv should be read AFTER checking row count (feeOp.seedHistory) in DB!
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
    await seedHistory();

    await seedIndexes();

    await updateMovingAverage();

    await updateAndBroadcastIndex(alertStreamServer);

    // every day:
    // setInterval(async () => {
    //   await updateMovingAverage();
    // }, movingAverageWatchInterval);

   // every 10 mins (block):
    setInterval(async () => {
      updateAndBroadcastIndex(alertStreamServer);
    }, indexWatchInterval //change to ten mins for prod
    );
    scheduleMovingAverageUpdate();
  } catch (error) {
    console.error("Error starting server:", error);
    process.exit(1);
  } finally {
    console.log("Index Watcher running...");
  }
}
