import fs from "fs";
import { parse } from "csv-parse";
import { FeeEstimates } from "@prisma/client";
import { handleError } from "../errors/e";
import { Decimal } from "@prisma/client/runtime/library";

export function getFeeEstimateHistoryFromCsv(
  filePath: string,
): Promise<FeeEstimates[] | Error> {
  try {
    return new Promise((resolve, reject) => {
      const headers: string[] = ["time", "satsPerByte"];

      const parser = parse({
        delimiter: ",",
        columns: (header) => {
          if (headers.every((h) => header.includes(h))) {
            return header;
          } else {
            console.log("CSV Headers:", header);
            reject(new Error("CSV headers do not match FeeEstimate fields."));
            return false;
          }
        },
        cast: true,
        castDate: true,
      });

      const records: FeeEstimates[] = [];

      fs.createReadStream(filePath)
        .pipe(parser)
        .on("readable", function () {
          let record;
          while ((record = this.read())) {
            // Check if satsPerByte is an empty string or not a number, set it to a default value or convert it
            record.satsPerByte = record.satsPerByte === ""
              ? "0"
              : record.satsPerByte; // Convert empty string to "0" or keep the number as string

            // Ensure satsPerByte is a valid number before converting to Decimal
            const satsPerByteValue = isNaN(Number(record.satsPerByte))
              ? 0
              : Number(record.satsPerByte);

            // Convert number to Decimal
            record.satsPerByte = new Decimal(satsPerByteValue);

            records.push(record as FeeEstimates);
          }
        })
        .on("end", () => {
          resolve(records);
        })
        .on("error", (err) => {
          reject(err);
        });
    });
  } catch (e) {
    handleError(e);
  }
}
