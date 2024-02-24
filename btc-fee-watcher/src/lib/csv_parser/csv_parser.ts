import fs from "fs";
import { parse } from "csv-parse";
import { FeeEstimate } from "@prisma/client";



export function getFeeEstimateHistoryFromCsv(filePath: string): Promise<FeeEstimate[]> {
  return new Promise((resolve, reject) => {
    const headers: string[] = ["time", "satsPerByte"];

    const parser = parse({
      delimiter: ",",
      columns: (header) => {
        console.log("Parsed Header:", header);
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

    const records: FeeEstimate[] = [];

    fs.createReadStream(filePath)
      .pipe(parser)
      .on("readable", function () {
        let record;
        while ((record = this.read())) {
      
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
