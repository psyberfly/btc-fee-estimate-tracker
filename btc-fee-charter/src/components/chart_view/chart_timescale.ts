import { TimeLib } from "../../lib/time";

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
    // console.log(dataPoint.x, xMin);

    const date: Date = new Date(dataPoint.x);
    const dateUnixTime: number = date.getTime();

    // Check if the data point is within the xMin and xMax range
    if (dateUnixTime >= xMin && dateUnixTime <= xMax) {
      maxYInXRange = Math.max(maxYInXRange, dataPoint.y);
    }
  }

  if (maxYInXRange >= 1 && maxYInXRange <= 10) {
    yMax = Math.ceil(maxYInXRange);
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
    "Last 1 hour": {
      setup: () => {
        const xMin = TimeLib.getMsSinceEpochXHoursAgo(1);
        const xMax = TimeLib.getMsSinceEpochXHoursAgo(0);
        return { xMin, xMax };
      },
      unit: TimescaleUnit.minute,
      stepSize: 10,
    },
    "Last 5 hours": {
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
    "Last 5 days": {
      setup: () => {
        const xMin = TimeLib.getMsSinceEpochXDaysAgo(5);
        const xMax = TimeLib.getMsSinceEpochXDaysAgo(0);
        return { xMin, xMax };
      },
      unit: TimescaleUnit.day,
      stepSize: 1,
    },
    "Last 1 month": {
      setup: () => {
        const xMin = TimeLib.getMsSinceEpochXMonthsAgo(1);
        const xMax = TimeLib.getMsSinceEpochXMonthsAgo(0);
        return { xMin, xMax };
      },
      unit: TimescaleUnit.week,
      stepSize: 1,
    },
    "Last 5 months": {
      setup: () => {
        const xMin = TimeLib.getMsSinceEpochXMonthsAgo(5);
        const xMax = TimeLib.getMsSinceEpochXMonthsAgo(0);
        return { xMin, xMax };
      },
      unit: TimescaleUnit.month,
      stepSize: 1,
    },
    "Last 1 year": {
      setup: () => {
        const xMin = TimeLib.getMsSinceEpochXYearsAgo(1);
        const xMax = TimeLib.getMsSinceEpochXYearsAgo(0);
        return { xMin, xMax };
      },
      unit: TimescaleUnit.month,
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

  public static getRangeOptions(): string[] {
    return Object.keys(this.timescaleConfigurations);
  }
}
