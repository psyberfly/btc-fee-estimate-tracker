import fs from "fs";
import { parse } from "csv-parse";
import { FeeEstimate } from "@prisma/client";

// Function to read CSV, validate headers, and convert to an array of FeeEstimate
export function getFeeEstimateHistoryFromCsv(
  filePath: string,
): Promise<FeeEstimate[]> {
  return new Promise((resolve, reject) => {
    // Manually define the headers that match the fields of FeeEstimate
    const headers: string[] = ["time", "satsPerByte"]; // Replace with actual field names of FeeEstimate

    // Create a parser instance
    const parser = parse({
      delimiter: ",", // or the delimiter used in your CSV
      columns: (header) => {
        // Check if all headers from the CSV match the fields from FeeEstimate
        if (headers.every((h) => header.includes(h))) {
          return header;
        } else {
          reject(new Error("CSV headers do not match FeeEstimate fields."));
          return false; // Stop parsing
        }
      },
      cast:true,
      castDate: true,
      // cast: (value, context) => {
      //   // Convert the time value to ISO format using the Date library
      //   if (context.records.header === "time" && value) {
      //     const date = new Date(value);
      //     if (!isNaN(date.getTime())) {
      //       return date.toISOString();
      //     } else {
      //       reject(new Error(`Invalid date format: ${value}`));
      //       return false; // Stop parsing
      //     }
      //   }
      //   return value;
      // },
    });

    const records: FeeEstimate[] = [];

    // Read the CSV file and pipe it to the parser
    fs.createReadStream(filePath)
      .pipe(parser)
      .on("readable", function () {
        let record;
        while (record = this.read()) {
          records.push(record as FeeEstimate);
        }
      })
      .on("end", () => {
        resolve(records);
      })
      .on("error", (err) => {
        reject(err);
      });
  });
}
