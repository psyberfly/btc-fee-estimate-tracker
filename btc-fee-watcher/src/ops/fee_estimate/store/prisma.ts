import { FeeEstimate } from "@prisma/client";
import { prisma } from "../../../main";
import { handleError } from "../../../lib/errors/e";

export class FeeEstimatePrismaStore {
  async readLatest(): Promise<FeeEstimate | Error> {
    try {
      const res = await prisma.feeEstimate.findFirst({
        orderBy: { time: "desc" },
      });
      const feeEstimateLatest: FeeEstimate = {
        id: res.id,
        time: res.time,
        satsPerByte: res.satsPerByte,
      };
      return feeEstimateLatest;
    } catch (e) {
      return handleError(e);
    }
  }

  async insert(rowData: FeeEstimate): Promise<FeeEstimate | Error> {
    try {
     const created = await prisma.feeEstimate.create({
        data: {
          time: rowData.time,
          satsPerByte: rowData.satsPerByte,
        },
      });
      return created;
    } catch (error) {
      return handleError(error);
    }
  }

  async insertMany(rows: FeeEstimate[]): Promise<boolean | Error> {
    try {
      await prisma.feeEstimate.createMany({
        data: rows.map((row) => ({
          time: row.time,
          satsPerByte: row.satsPerByte,
        })),
      });
      return true;
    } catch (error) {
      return handleError(error);
    }
  }

  async readByRange(
    fromDate: string,
    toDate: string,
  ): Promise<FeeEstimate[] | Error> {
    try {
      const feeEstHistory = await prisma.feeEstimate.findMany({
        where: {
          AND: [
            { time: { gte: new Date(fromDate) } },
            { time: { lte: new Date(toDate) } },
          ],
        },
        orderBy: {
          time: 'asc', // (old to new)
        },
      });
      return feeEstHistory.map((row) => ({
        id: row.id,
        time: row.time,
        satsPerByte: row.satsPerByte,
      }));
    } catch (error) {
      return handleError(error);
    }
  }

  async readAll(since:Date): Promise<FeeEstimate[] | Error> {
    try {
      // Initialize the query parameters with orderBy
      let queryParameters: any = {
        orderBy: { time: "desc" },
      };

      // If since is provided, add a where clause to the query parameters
      if (since) {
        queryParameters.where = {
          time: {
            gt: since, // Use the "gt" (greater than) operator to filter records after the "since" date
          },
        };
      }

      const allFeeEstRes = await prisma.feeEstimate.findMany(queryParameters);

      return allFeeEstRes;
    } catch (error) {
      return handleError(error);
    }
  }

  async checkCount(): Promise<number | Error> {
    try {
      const res = await prisma.feeEstimate.count();

      return res;
    } catch (e) {
      return handleError(e);
    }
  }
}
