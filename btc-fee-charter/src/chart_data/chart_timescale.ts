import { TimeLib } from "../lib/time";

export enum TimeRange {
  Last1Hour = "Last 1 hour",
  Last5Hours = "Last 5 hours",
  Last1Day = "Last 1 day",
  Last5Days = "Last 5 days",
  Last1Month = "Last 1 month",
  Last5Months = "Last 5 months",
  Last1Year = "Last 1 year",
  Last5Years = "Last 5 years",
  AllTime = "All Time",
}

enum TimescaleUnit {
  minute = "minute",
  hour = "hour",
  day = "day",
  week = "week",
  month = "month",
  year = "year",
}

export interface TimescaleOptions {
  xMin: number; //ms since epoch
  xMax: number; //ms since epoch
  yMax: number;
  unit: string;
  stepSize: number;
}

function calculateYMax(xMin: number, xMax: number, datasets: any): number {
  let yMax: number;

  let maxYInXRange = Number.MIN_SAFE_INTEGER;

  const dataPoints: { x: Date; y: number }[] = datasets.flatMap((dataset) =>
    dataset.data.flatMap((obj) => obj)
  );

  for (const dataPoint of dataPoints) {
    const date: Date = new Date(dataPoint.x);
    const dateUnixTime: number = date.getTime();

    // Check if the data point is within the xMin and xMax range
    if (dateUnixTime >= xMin && dateUnixTime <= xMax) {
      maxYInXRange = Math.max(maxYInXRange, dataPoint.y);
    }
  }

  if (maxYInXRange >= 1 && maxYInXRange <= 10) {
    yMax = Math.ceil(maxYInXRange);
  } else if (maxYInXRange >= 10 && maxYInXRange <= 50) {
    yMax = Math.ceil(maxYInXRange / 10) * 10;
  } else if (maxYInXRange >= 10 && maxYInXRange <= 100) {
    yMax = (Math.ceil(maxYInXRange / 10) * 10) + 10;
    // Round up to the next whole multiple of 1
  } else if (maxYInXRange >= 100 && maxYInXRange <= 1000) {
    yMax = (Math.ceil(maxYInXRange / 10) * 10) + 10;
  } else if (maxYInXRange >= 1000 && maxYInXRange <= 10000) {
    yMax = (Math.ceil(maxYInXRange / 100) * 100) + 100;
  } else {
    yMax = Math.ceil(maxYInXRange);
  }

  return yMax;
}

export class ChartTimescale {
  private static timescaleConfigurations = {
    [TimeRange.Last1Hour]: {
      setup: () => {
        const xMin = TimeLib.getMsSinceEpochXHoursAgo(1);
        const xMax = TimeLib.getMsSinceEpochXHoursAgo(0);
        return { xMin, xMax };
      },
      unit: TimescaleUnit.minute,
      stepSize: 10,
    },
    [TimeRange.Last5Hours]: {
      setup: () => {
        const xMin = TimeLib.getMsSinceEpochXHoursAgo(5);
        const xMax = TimeLib.getMsSinceEpochXHoursAgo(0);
        return { xMin, xMax };
      },
      unit: TimescaleUnit.hour,
      stepSize: 1,
    },
    "Last 1 day": {
      setup: () => {
        const xMin = TimeLib.getMsSinceEpochXDaysAgo(1);
        const xMax = TimeLib.getMsSinceEpochXDaysAgo(0);
        return { xMin, xMax };
      },
      unit: TimescaleUnit.hour,
      stepSize: 6,
    },
    [TimeRange.Last5Days]: {
      setup: () => {
        const xMin = TimeLib.getMsSinceEpochXDaysAgo(5);
        const xMax = TimeLib.getMsSinceEpochXDaysAgo(0);
        return { xMin, xMax };
      },
      unit: TimescaleUnit.day,
      stepSize: 1,
    },
    [TimeRange.Last1Month]: {
      setup: () => {
        const xMin = TimeLib.getMsSinceEpochXMonthsAgo(1);
        const xMax = TimeLib.getMsSinceEpochXMonthsAgo(0);
        return { xMin, xMax };
      },
      unit: TimescaleUnit.week,
      stepSize: 1,
    },
    [TimeRange.Last5Months]: {
      setup: () => {
        const xMin = TimeLib.getMsSinceEpochXMonthsAgo(5);
        const xMax = TimeLib.getMsSinceEpochXMonthsAgo(0);
        return { xMin, xMax };
      },
      unit: TimescaleUnit.month,
      stepSize: 1,
    },
    [TimeRange.Last1Year]: {
      setup: () => {
        const xMin = TimeLib.getMsSinceEpochXYearsAgo(1);
        const xMax = TimeLib.getMsSinceEpochXYearsAgo(0);
        return { xMin, xMax };
      },
      unit: TimescaleUnit.month,
      stepSize: 1,
    },
    [TimeRange.Last5Years]: {
      setup: () => {
        const xMin = TimeLib.getMsSinceEpochXYearsAgo(5);
        const xMax = TimeLib.getMsSinceEpochXYearsAgo(0);
        return { xMin, xMax };
      },
      unit: TimescaleUnit.year,
      stepSize: 1,
    },
    [TimeRange.AllTime]: {
      setup: () => {
        const xMin = 1590105600000; //22 May 2020, fee estimate data start;
        const xMax = TimeLib.getMsSinceEpochXYearsAgo(0);
        return { xMin, xMax };
      },
      unit: TimescaleUnit.year,
      stepSize: 1,
    },
  };

  public static getTimescaleOptions(
    selectedRange: string,
    datasets: { x: Date; y: number }[],
  ): TimescaleOptions {
    const configuration = ChartTimescale.timescaleConfigurations[selectedRange];
    if (configuration) {
      const { xMin, xMax } = configuration.setup();
      const yMax = calculateYMax(xMin, xMax, datasets);
      return {
        xMin,
        xMax,
        yMax,
        unit: configuration.unit,
        stepSize: configuration.stepSize,
      };
    } else {
      throw new Error("Error: Could not find timescale option!");
    }
  }

  public static getRangeOptions(): TimeRange[] {
    return Object.values(TimeRange);
  }

  public static getStartEndTimestampsFromTimerange(
    selectedRange: TimeRange,
  ): [number, number] {
    const configuration = ChartTimescale.timescaleConfigurations[selectedRange];
    if (configuration) {
      const { xMin, xMax } = configuration.setup();
      return [xMin, xMax];
    } else {
      throw new Error(
        "Error: Could not find data start timestamp for the selected range!",
      );
    }
  }

  public static getStartEndTimestampsFromTimerangeAsDate(
    selectedRange: TimeRange,
  ): [Date, Date] {
 
    const configuration = ChartTimescale.timescaleConfigurations[selectedRange];
    if (configuration) {
      const { xMin, xMax } = configuration.setup();
      let startDate: Date;
  
      return [new Date(xMin), new Date(xMax)];
    } else {
      throw new Error(
        "Error: Could not find data start timestamp for the selected range!",
      );
    }
  }
}
