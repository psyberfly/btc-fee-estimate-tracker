import { ONE_HOUR_MS, ONE_MINUTE_MS } from "../../lib/time/time";

export enum HistoryOutputInterval {
  Minute = ONE_MINUTE_MS, //<last 5Days
  Hour = ONE_HOUR_MS, //=>last 5days
  SixHour = 6 * ONE_HOUR_MS, //>last5days <=last 1 month
  TwelveHour = 12 * ONE_HOUR_MS, //>=last1 month <=last1year
  TwentyFourHour = 24 * ONE_HOUR_MS, //more than last 1 year
  FortyEightHour = 48 * ONE_HOUR_MS, //more than last 1 year

}

export function filterHistoryByInterval<T extends { time: Date }>(
  data: T[],
  interval: HistoryOutputInterval,
): T[] {
  // Define the interval in milliseconds
  const intervalMillis = interval.valueOf();

  let lastTimestamp: number = null;
  return data.filter((f) => {
    const currentTimestamp = new Date(f.time).getTime();
    if (
      lastTimestamp === null ||
      (currentTimestamp - lastTimestamp) >= intervalMillis
    ) {
      lastTimestamp = currentTimestamp;
      return true;
    }
    return false;
  });
}

export function getHistoryOutputIntervalFromReq(
  since: Date,
): HistoryOutputInterval {
  const now = new Date();
  const timeDifference = now.getTime() - since.getTime(); // Calculate the time difference in milliseconds

  const fiveDays = 5 * HistoryOutputInterval.TwentyFourHour.valueOf();
  const oneMonth = 30 * HistoryOutputInterval.TwentyFourHour.valueOf();
  const oneYear = 365 * HistoryOutputInterval.TwentyFourHour.valueOf();
  const fiveYears = 5 * oneYear;

  if (timeDifference < fiveDays) {
    return HistoryOutputInterval.Minute;
  } else if (timeDifference >= fiveDays && timeDifference < oneMonth) {
    return HistoryOutputInterval.Hour;
  } else if (timeDifference >= oneMonth && timeDifference < oneYear) {
    return HistoryOutputInterval.SixHour;
  } else if (timeDifference >= oneYear && timeDifference < 2 * oneYear) {
    return HistoryOutputInterval.TwelveHour;
  } else if (timeDifference >= fiveYears && timeDifference < 1.5 * fiveYears) {
    return HistoryOutputInterval.TwentyFourHour;
  }else {
    return HistoryOutputInterval.FortyEightHour;
  }
}

export function getUnarchivedIntervals(threshold: number): HistoryOutputInterval[] {
    // Get the enum values as an array
    const enumValues = Object.values(HistoryOutputInterval).filter(
      (value) => typeof value === 'number'
    ) as number[];
  
    // Filter the enum values that are less than the threshold
    const filteredValues = enumValues.filter((value) => value < threshold);
  
    return filteredValues;
  }