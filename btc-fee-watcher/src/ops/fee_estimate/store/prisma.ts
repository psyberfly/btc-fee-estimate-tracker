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

  async insert(rowData: FeeEstimate): Promise<boolean | Error> {
    try {
      await prisma.feeEstimate.create({
        data: {
          time: rowData.time,
          satsPerByte: rowData.satsPerByte,
        },
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
}
