export class TimeLib {
  static getMsSinceEpochXHoursAgo(hours: number) {
    // Get the current time in milliseconds since epoch
    const currentTime = Date.now();
    // Calculate the time X hours ago (in milliseconds)
    const timeXHoursAgo = currentTime - (hours * 3600 * 1000);
    return timeXHoursAgo;
  }

  static getMsSinceEpochXDaysAgo = (days: number): number => {
    const currentDate = new Date();
    const thirtyDaysAgo = new Date(
      currentDate.getTime() - (days * 24 * 60 * 60 * 1000),
    ); // Subtract 30 days in milliseconds
    return thirtyDaysAgo.getTime(); // Returns the date 30 days ago in milliseconds since epoch
  };

  static getMsSinceEpochXMonthsAgo(months: number) {
    const currentDate = new Date();
    const targetDate = new Date(currentDate);

    // Calculate the year and month X months ago
    targetDate.setMonth(targetDate.getMonth() - months);

    // Get the timestamp of the target date
    const timestampXMonthsAgo = targetDate.getTime();

    return timestampXMonthsAgo;
  }

  static getMsSinceEpochXYearsAgo(years: number) {
    const currentDate = new Date();
    const targetDate = new Date(currentDate);

    // Calculate the year X years ago
    targetDate.setFullYear(targetDate.getFullYear() - years);

    // Get the timestamp of the target date
    const timestampXYearsAgo = targetDate.getTime();

    return timestampXYearsAgo;
  }
}
