import { getFeeEstimateHistoryFromCsv } from "../lib/csv_parser/csv_parser";
import { handleError } from "../lib/errors/e";
import { ONE_HOUR_MS, ONE_MINUTE_MS, TEN_MINUTES_MS } from "../lib/time/time";
import { FeeOp } from "../ops/fee_estimate/fee_estimate";
import { IndexOp } from "../ops/fee_index/fee_index";
import { MovingAverageOp } from "../ops/moving_average/moving_average";
import { AlertStreamServer } from "./ws";

export const indexWatchInterval = ONE_MINUTE_MS;
export const archivalStepSize = 6 * ONE_HOUR_MS;

const movingAverageOp = new MovingAverageOp();
const feeOp = new FeeOp();
const indexOp = new IndexOp();
let archiveStartTime: Date;
let archiveEndTime: Date;
let indexStartDates = { "30Day": new Date(), "365Day": new Date() };

async function seedIndexes() {
  try {
    console.log(`Seeding indexes since ${indexStartDates["365Day"]}...`);
    console.log("Seeding moving averages...");
    const isMovingAvgSeeded = await movingAverageOp.seed(
      indexStartDates["365Day"],
    );
    if (isMovingAvgSeeded instanceof Error) {
      console.error(`Error seeding moving averages: ${isMovingAvgSeeded}`);
      return;
    }
    console.log("Seeding indexes...");
    const isIndexesSeeded = await indexOp.seed(indexStartDates["365Day"]);
    if (isIndexesSeeded instanceof Error) {
      console.error(`Error seeding indexes: ${isIndexesSeeded}`);
      return;
    }
    const isHistoryArchived = await indexOp.archiveData(
      archiveStartTime,
      archiveEndTime,
      archivalStepSize,
    );

    if (isHistoryArchived instanceof Error) {
      console.error(`Error archiving history: ${isHistoryArchived}`);
      return;
    }
    console.log("Fee Index History archived.");
  } catch (e) {
    console.error(`Error in seedIndex: ${e}`);
  }
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

async function scheduleDataArchive() {
  // Set delay for 6 hours in milliseconds (6 hours * 60 minutes * 60 seconds * 1000 milliseconds)
  const interval = archivalStepSize;

  // Schedule to run every 6 hours
  setTimeout(async () => {
    await archiveData();
    // After running, schedule the next execution
    scheduleDataArchive();
  }, interval);
}

async function archiveData() {
  const toTime = new Date();
  const fromTime = new Date(toTime.getTime() - archivalStepSize);
  await feeOp.archiveData(fromTime, toTime, archivalStepSize);
  await indexOp.archiveData(fromTime, toTime, archivalStepSize);
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
    const latestIndex = await indexOp.readLatestDetailed();

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

async function seedHistory(): Promise<boolean> {
  console.log("Seeding Fee Estimates history from .csv...");
  //Fee Estimate:
  //csv should be read AFTER checking row count (feeOp.seedHistory) in DB!
  const csvFilePath = process.env.PATH_TO_CSV;

  const feeHistory = await getFeeEstimateHistoryFromCsv(csvFilePath);

  if (feeHistory instanceof Error) {
    console.error(
      `Error reading Fee Estimate history from .csv!: ${feeHistory}`,
    );
    return false;
  }

  const feeHistoryStartDate = feeHistory[0].time;

  setIndexStartDates(feeHistoryStartDate);
  const isHistorySeeded = await feeOp.seedHistory(feeHistory);

  if (isHistorySeeded instanceof Error) {
    console.error(
      `Error seeding Fee Estimate history to DB!: ${isHistorySeeded}`,
    );
    return false;
  }

  console.log("Fee Estimate History seeded from .csv.");

  archiveStartTime = feeHistory[0].time;
  archiveEndTime = feeHistory[feeHistory.length - 1].time;
  const isHistoryArchived = await feeOp.archiveData(
    archiveStartTime,
    archiveEndTime,
    archivalStepSize,
  );

  if (isHistoryArchived instanceof Error) {
    console.error(`Error archiving history: ${isHistoryArchived}`);
    return;
  }
  console.log("Fee Estimate History archived.");
  return true;
}

function setIndexStartDates(feeHistoryStartDate: Date) {
  let startDate30Day: Date = new Date(feeHistoryStartDate);
  startDate30Day.setDate(startDate30Day.getDate() + 30);

  // Calculate 365 days after indexStartDate
  let startDate365Day: Date = new Date(feeHistoryStartDate);
  startDate365Day.setDate(startDate365Day.getDate() + 365);

  indexStartDates["30Day"] = startDate30Day;
  indexStartDates["365Day"] = startDate365Day;
}

export async function runIndexWatcher() {
  try {
    const port: string = process.env.WSS_PORT;
    const baseApiRoute = "/api/v1";
    const alertStreamServer = new AlertStreamServer(port, baseApiRoute);

    const isHistorySeeded = await seedHistory();

    if (isHistorySeeded) {
      await seedIndexes();
    }
    await updateMovingAverage();

    await updateAndBroadcastIndex(alertStreamServer);

    scheduleUpdateAndBroadcastIndex(alertStreamServer);

    scheduleMovingAverageUpdate();

    await scheduleDataArchive();
  } catch (error) {
    console.error("Error starting server:", error);
    process.exit(1);
  } finally {
    console.log("Index Watcher running...");
  }
}
function scheduleUpdateAndBroadcastIndex(alertStreamServer: AlertStreamServer) {
  setInterval(async () => {
    updateAndBroadcastIndex(alertStreamServer);
  }, indexWatchInterval);
}
