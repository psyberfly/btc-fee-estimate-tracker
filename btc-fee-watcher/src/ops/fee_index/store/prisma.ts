import { FeeIndex } from "@prisma/client";
import { handleError } from "../../../lib/errors/e";
import { prisma } from "../../../main";
import { IndexResponse } from "../interface";

export class FeeIndexPrismaStore {
  async fetchLatest(): Promise<IndexResponse | Error> {
    try {
      const latestIndex = await prisma.feeIndex.findFirst({
        orderBy: { createdAt: "desc" },
        include: {
          feeEstimate: true,
          movingAverage: true,
        },
      });

      const latestIndexRes: IndexResponse = {
        timestamp: latestIndex.createdAt,
        feeEstimateMovingAverageRatio: {
          last365Days: latestIndex.ratioLast365Days.toNumber(),
          last30Days: latestIndex.ratioLast30Days.toNumber(),
        },
        currentFeeEstimate: {
          time: latestIndex.feeEstimate.time,
          satsPerByte: latestIndex.feeEstimate.satsPerByte.toNumber(),
        },
        movingAverage: {
          createdAt: latestIndex.movingAverage.createdAt,
          last365Days: latestIndex.movingAverage.last365Days.toNumber(),
          last30Days: latestIndex.movingAverage.last30Days.toNumber(),
        },
      };

      return latestIndexRes;
    } catch (error) {
      return handleError(error);
    }
  }

  async fetchAll(): Promise<IndexResponse[] | Error> {
    try {
      const allIndex = await prisma.feeIndex.findMany({
        orderBy: { createdAt: "desc" },
        include: {
          feeEstimate: true,
          movingAverage: true,
        },
      });

      let allIndexRes: IndexResponse[] = [];

      allIndex.forEach((index) => {
        const indexRes: IndexResponse = {
          timestamp: index.createdAt,
          feeEstimateMovingAverageRatio: {
            last365Days: index.ratioLast365Days.toNumber(),
            last30Days: index.ratioLast30Days.toNumber(),
          },
          currentFeeEstimate: {
            time: index.feeEstimate.time,
            satsPerByte: index.feeEstimate.satsPerByte.toNumber(),
          },
          movingAverage: {
            createdAt: index.movingAverage.createdAt,
            last365Days: index.movingAverage.last365Days.toNumber(),
            last30Days: index.movingAverage.last30Days.toNumber(),
          },
        };
        allIndexRes.push(indexRes);
      });

      return allIndexRes;
    } catch (error) {
      return handleError(error);
    }
  }

  async insert(index: FeeIndex): Promise<boolean | Error> {
    try {
      await prisma.feeIndex.create({
        data: {
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
}
