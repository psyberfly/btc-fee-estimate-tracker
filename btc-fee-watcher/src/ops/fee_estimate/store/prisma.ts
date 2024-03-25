import { FeeEstimates, FeeEstimatesArchive } from "@prisma/client";
import { prisma } from "../../../main";
import { handleError } from "../../../lib/errors/e";
import { FeeEstimatesArchiveBulkInsert } from "../interface";

export class FeeEstimatePrismaStore {
  async readLatest(): Promise<FeeEstimates | Error> {
    try {
      const res = await prisma.feeEstimates.findFirst({
        orderBy: { time: "asc" },
      });
      const feeEstimateLatest: FeeEstimates = {
        id: res.id,
        time: res.time,
        satsPerByte: res.satsPerByte,
        createdAt: res.createdAt,
      };
      return feeEstimateLatest;
    } catch (e) {
      return handleError(e);
    }
  }

  async insert(rowData: FeeEstimates): Promise<FeeEstimates | Error> {
    try {
      const created = await prisma.feeEstimates.create({
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

  async insertMany(rows: FeeEstimates[]): Promise<boolean | Error> {
    try {
      await prisma.feeEstimates.createMany({
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
  ): Promise<FeeEstimates[] | Error> {
    try {
      const feeEstHistory = await prisma.feeEstimates.findMany({
        where: {
          AND: [
            { time: { gte: new Date(fromDate) } },
            { time: { lte: new Date(toDate) } },
          ],
        },
        orderBy: {
          time: "asc", // (old to new)
        },
      });
     return feeEstHistory;
    } catch (error) {
      return handleError(error);
    }
  }

  async readAll(since: Date): Promise<FeeEstimates[] | Error> {
    try {
      // Initialize the query parameters with orderBy
      let queryParameters: any = {
        orderBy: { time: "asc" },
      };

      // If since is provided, add a where clause to the query parameters
      if (since) {
        queryParameters.where = {
          time: {
            gte: since, // Use the "gt" (greater than) operator to filter records after the "since" date
          },
        };
      }

      const allFeeEstRes = await prisma.feeEstimates.findMany(queryParameters);

      return allFeeEstRes;
    } catch (error) {
      return handleError(error);
    }
  }
  // async insertArchive(
  //   row: FeeEstimatesArchive,
  // ): Promise<boolean | Error> {
  //   try {
  //     const created = await prisma.feeEstimatesArchive.create({
  //       data: row,
  //     });
  //     return true;
  //   } catch (error) {
  //     return handleError(error);
  //   }
  // }

  async insertManyArchive(
    rows: FeeEstimatesArchiveBulkInsert[],
  ): Promise<boolean | Error> {
    try {
      const created = await prisma.feeEstimatesArchive.createMany({
        data: rows,
      });

      return true;
    } catch (error) {
      return handleError(error);
    }
  }

  async readByRangeArchive(
    fromDate: string,
    toDate: string,
  ): Promise<FeeEstimatesArchive[] | Error> {
    try {
      const feeEstHistory = await prisma.feeEstimatesArchive.findMany({
        where: {
          AND: [
            { startTime: { gte: new Date(fromDate) } },
            { endTime: { lte: new Date(toDate) } },
          ],
        },
        orderBy: {
          createdAt: "asc", // (old to new)
        },
      });
      return feeEstHistory as FeeEstimatesArchive[];
    } catch (error) {
      return handleError(error);
    }
  }

  async checkCount(): Promise<number | Error> {
    try {
      const res = await prisma.feeEstimates.count();

      return res;
    } catch (e) {
      return handleError(e);
    }
  }
}
