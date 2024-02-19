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
