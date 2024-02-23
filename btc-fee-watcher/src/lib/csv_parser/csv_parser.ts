import fs from 'fs';
import { parse } from 'csv-parse';
import { FeeEstimate } from '@prisma/client';

// Function to read CSV, validate headers, and convert to an array of FeeEstimate
function readCsvAndConvertToMyType(filePath: string): Promise<FeeEstimate[]> {
  return new Promise((resolve, reject) => {
    // Manually define the headers that match the fields of FeeEstimate
    const headers: string[] = ['time', 'satsPerByte', ]; // Replace with actual field names of FeeEstimate

    // Create a parser instance with options
    const parser = parse({
      delimiter: ',', // or the delimiter used in your CSV
      columns: (header) => {
        // Check if all headers from the CSV match the fields from FeeEstimate
        if (headers.every(h => header.includes(h))) {
          return header;
        } else {
          reject(new Error('CSV headers do not match FeeEstimate fields.'));
          return false; // Stop parsing
        }
      }
    });

    const records: FeeEstimate[] = [];

    // Read the CSV file and pipe it to the parser
    fs.createReadStream(filePath)
      .pipe(parser)
      .on('readable', function() {
        let record;
        while (record = this.read()) {
          records.push(record as FeeEstimate);
        }
      })
      .on('end', () => {
        resolve(records);
      })
      .on('error', (err) => {
        reject(err);
      });
  });
}

// Usage
const filePath = 'path/to/your/file.csv'; // Replace with your file path
readCsvAndConvertToMyType(filePath)
  .then((myTypesArray) => {
    // Process the array of FeeEstimate
    console.log(myTypesArray);
  })
  .catch((error) => {
    console.error('Error:', error);
  });
