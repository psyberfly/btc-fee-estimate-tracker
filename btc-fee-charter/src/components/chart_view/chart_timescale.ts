import { TimeLib } from "../../lib/time";

enum TimescaleUnit {
  minute = "minute",
  hour = "hour",
  day = "day",
  month = "month",
  year = "year",
}

export interface TimescaleOptions {
  xMin: number; //ms since epoch
  xMax: number;//ms since epoch
  unit: string; 
}

export class ChartTimescale {
  private static timescaleConfigurations = {
    "Last 1 hour": {
      xMin: () => TimeLib.getMsSinceEpochXHoursAgo(1),
      xMax: () => TimeLib.getMsSinceEpochXHoursAgo(0),
      unit: TimescaleUnit.minute
    },
    "Last 5 hours": {
      xMin: () => TimeLib.getMsSinceEpochXHoursAgo(5),
      xMax: () => TimeLib.getMsSinceEpochXHoursAgo(0),
      unit: TimescaleUnit.hour
    },
    "Last 1 day": {
      xMin: () => TimeLib.getMsSinceEpochXDaysAgo(1),
      xMax: () => TimeLib.getMsSinceEpochXDaysAgo(0),
      unit: TimescaleUnit.hour,
    },
    "Last 5 days": {
      xMin: () => TimeLib.getMsSinceEpochXDaysAgo(5),
      xMax: () => TimeLib.getMsSinceEpochXDaysAgo(0),
      unit: TimescaleUnit.day,
    },
    "Last 1 month": {
      xMin: () => TimeLib.getMsSinceEpochXMonthsAgo(1),
      xMax: () => TimeLib.getMsSinceEpochXMonthsAgo(0),
      unit: TimescaleUnit.day,
    },
    "Last 5 months": {
      xMin: () => TimeLib.getMsSinceEpochXMonthsAgo(5),
      xMax: () => TimeLib.getMsSinceEpochXMonthsAgo(0),
      unit: TimescaleUnit.day,
    },
    "Last 1 year": {
      xMin: () => TimeLib.getMsSinceEpochXYearsAgo(1),
      xMax: () => TimeLib.getMsSinceEpochXYearsAgo(0),
      unit: TimescaleUnit.month,
    },
  };

  public static getTimescaleOptions(selectedRange: string): TimescaleOptions {
    const timescaleConfiguration =
      ChartTimescale.timescaleConfigurations[selectedRange];
    if (timescaleConfiguration) {
      return {
        xMin: timescaleConfiguration.xMin(),
        xMax: timescaleConfiguration.xMax(),
        unit: timescaleConfiguration.unit,
      };
    } else {
      throw ("Error: Could not find timescale option!");
    }
  }

  public static getRangeOptions(): string[] {
    return Object.keys(this.timescaleConfigurations);
  }
}
