import { FeeIndexes } from "@prisma/client";
import { handleError } from "../../../lib/errors/e";
import { prisma } from "../../../main";
import { FeeIndexDetailed, FeeIndexesArchiveBulkInsert } from "../interface";
export class FeeIndexPrismaStore {
  async fetchLatest(): Promise<FeeIndexDetailed | Error> {
    try {
      const latestIndex = await prisma.feeIndexes.findFirst({
        orderBy: { time: "desc" },
        include: {
          feeEstimate: true,
          movingAverage: true,
        },
      });

      const latestIndexRes: FeeIndexDetailed = {
        time: latestIndex.time,
        feeEstimateMovingAverageRatio: {
          last365Days: latestIndex.ratioLast365Days.toNumber(),
          last30Days: latestIndex.ratioLast30Days.toNumber(),
        },
        currentFeeEstimate: {
          time: latestIndex.feeEstimate.time,
          satsPerByte: latestIndex.feeEstimate.satsPerByte.toNumber(),
        },
        movingAverage: {
          day: latestIndex.movingAverage.day,
          last365Days: latestIndex.movingAverage.last365Days.toNumber(),
          last30Days: latestIndex.movingAverage.last30Days.toNumber(),
        },
      };

      return latestIndexRes;
    } catch (error) {
      return handleError(error);
    }
  }

  // async fetchAll(): Promise<FeeIndex[] | Error> {
  //   try {
  //     const allFeeIndexRes = await prisma.feeIndex.findMany({
  //       orderBy: { createdAt: "desc" },
  //     });

  //     return allFeeIndexRes;
  //   } catch (error) {
  //     return handleError(error);
  //   }
  // }

  async fetchAll(since?: Date): Promise<FeeIndexes[] | Error> {
    try {
      // Initialize the query parameters with orderBy
      let queryParameters: any = {
        orderBy: { time: "asc" },
      };

      // If since is provided, add a where clause to the query parameters
      if (since) {
        queryParameters.where = {
          time: {
            gt: since, // Use the "gt" (greater than) operator to filter records after the "since" date
          },
        };
      }

      const allFeeIndexRes = await prisma.feeIndexes.findMany(queryParameters);

      return allFeeIndexRes;
    } catch (error) {
      return handleError(error);
    }
  }

  async fetchDetailed90Days(from: Date): Promise<FeeIndexDetailed[] | Error> {
    try {
      const startDate = from;
      const endDate = new Date(from);
      endDate.setDate(endDate.getDate() + 90);

      const allIndexDetailed = await prisma.feeIndexes.findMany({
        where: {
          createdAt: {
            gte: startDate,
            lt: endDate,
          },
        },
        orderBy: { createdAt: "asc" },
        include: {
          feeEstimate: true,
          movingAverage: true,
        },
      });

      let allIndexDetailedRes: FeeIndexDetailed[] = [];

      allIndexDetailed.forEach((index) => {
        const indexRes: FeeIndexDetailed = {
          time: index.time,
          feeEstimateMovingAverageRatio: {
            last365Days: index.ratioLast365Days.toNumber(),
            last30Days: index.ratioLast30Days.toNumber(),
          },
          currentFeeEstimate: {
            time: index.feeEstimate.time,
            satsPerByte: index.feeEstimate.satsPerByte.toNumber(),
          },
          movingAverage: {
            day: index.movingAverage.day,
            last365Days: index.movingAverage.last365Days.toNumber(),
            last30Days: index.movingAverage.last30Days.toNumber(),
          },
        };
        allIndexDetailedRes.push(indexRes);
      });

      return allIndexDetailedRes;
    } catch (error) {
      return handleError(error);
    }
  }

  async readByRange(
    fromDate: string,
    toDate: string,
  ): Promise<FeeIndexes[] | Error> {
    try {
      const feeIndexes = await prisma.feeIndexes.findMany({
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
      return feeIndexes;
    } catch (error) {
      return handleError(error);
    }
  }

  async insert(index: FeeIndexes): Promise<boolean | Error> {
    try {
      const upserted = await prisma.feeIndexes.upsert({
        where: {
          feeEstimateId: index.feeEstimateId, // Unique identifier
        },
        update: {
          movingAverageId: index.movingAverageId,
          ratioLast365Days: index.ratioLast365Days,
          ratioLast30Days: index.ratioLast30Days,
        },
        create: {
          time: index.time,
          feeEstimateId: index.feeEstimateId,
          movingAverageId: index.movingAverageId,
          ratioLast365Days: index.ratioLast365Days,
          ratioLast30Days: index.ratioLast30Days,
        },
      });
      return true;
    } catch (error) {
      return handleError(error);
    }
  }

  async insertManyArchive(
    rows: FeeIndexesArchiveBulkInsert[],
  ): Promise<boolean | Error> {
    try {
      const created = await prisma.feeIndexesArchive.createMany({
        data: rows,
      });

      return true;
    } catch (error) {
      return handleError(error);
    }
  }
}
