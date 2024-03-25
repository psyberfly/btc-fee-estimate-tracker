import { isBefore, isEqual, subMonths } from "date-fns";

export enum UTCDate {
  today,
  lastMonth,
  lastYear,
}

export function fetchDate(reqDate: UTCDate): string {
  const today = new Date();
  switch (reqDate) {
    case UTCDate.today:
      return new Date().toUTCString();

    case UTCDate.lastMonth:
      const lastMonth = new Date(
        Date.UTC(
          today.getUTCFullYear(),
          today.getUTCMonth() - 1,
          today.getUTCDate(),
        ),
      );
      return lastMonth.toUTCString();

    case UTCDate.lastYear:
      const lastYear = new Date(
        Date.UTC(
          today.getUTCFullYear() - 1,
          today.getUTCMonth(),
          today.getUTCDate(),
        ),
      );

      return lastYear.toUTCString();

    default:
      throw (Error("Unknown UTCDate argument"));
  }
}

export function isFiveMonthsAgoOrMore(dateToCheck: Date): boolean {
  // Create a Date object for the current time
  const now = new Date();

  // Subtract 5 months from the current date to get the threshold date
  const fiveMonthsAgo = subMonths(now, 5);

  // Check if the dateToCheck is before or equal to fiveMonthsAgo
  return isBefore(dateToCheck, fiveMonthsAgo) ||
    isEqual(dateToCheck, fiveMonthsAgo);
}
