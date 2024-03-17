import { ChartType } from "../chart_data/interface";
import { IStore } from "./interface";
import { db } from "./lokisjs";
import { CustomError } from "../lib/e";
export class LokiStore implements IStore {
  private collection = (chartType: ChartType) => {
    return db.getCollection(chartType);
  };

  async readLatest(
    chartType: ChartType,
  ): Promise<any | Error> {
    try {
      // Note: Adjust the query as needed. This is a basic example.
      const results = this.collection(chartType)
        .chain()
        .find({})
        .simplesort("time", true) // Sorts in descending order
        .limit(1) // Limits to only 1 entry, the most recent
        .data();

      if (results.length === 0) {
        return null;
      }

      // Return the first element of the results array
      return results[0];
    } catch (error) {
      return error;
    }
  }
  async getHistoryStartTime(chartType: ChartType): Promise<Date | Error> {
    try {
      const earliestEntry = this.collection(chartType).chain().find({})
        .simplesort("time").limit(1).data();
      if (earliestEntry.length > 0) {
        const date = earliestEntry[0]["time"]; // Assuming 'latestEntry' is not empty.
        return date;
      } else {
        return new CustomError(
          "Error getting history start time: No entry found",
          "404",
        );
      }
    } catch (error) {
      return error;
    }
  }
  async getHistoryEndTime(chartType: ChartType): Promise<Date | Error> {
    try {
      const lastEntry = this.collection(chartType).chain().find({})
        .simplesort("time", true).limit(1).data();
      if (lastEntry.length > 0) {
        const date = lastEntry[0]["time"]; // Assuming 'latestEntry' is not empty.
        return date;
      } else {
        return new CustomError(
          "Error getting history start time: No entry found",
          "404",
        );
      }
    } catch (error) {
      return error;
    }
  }

  async readMany(
    chartType: ChartType,
    from?: Date,
    to?: Date,
  ): Promise<any | Error> {
    try {
      let query = {};
      if (from || to) {
        query = { "time": { "$gte": from, "$lte": to } };
      }

      return this.collection(chartType)
        .chain()
        .find(
          query,
        )
        .simplesort("time")
        .data();
    } catch (error) {
      return error;
    }
  }
  async upsert(
    chartType: ChartType,
    data: any,
  ): Promise<boolean | Error> {
    try {
      const collection = this.collection(chartType);
      data.forEach((item) => {
        const existing = collection.findOne({ time: item["time"] }); // Assuming each item has an id
        if (existing) {
          collection.update({ ...existing, ...item });
        } else {
          collection.insert(item);
        }
      });
      return true;
    } catch (error) {
      return error;
    }
  }
}
