import { MovingAverage } from "@prisma/client";
import { prisma } from "../../../main";
import { handleError } from "../../../lib/errors/e";

export class MovingAveragePrismaStore {
  async readLatest(): Promise<MovingAverage | Error> {
    try {
      const movingAverage = await prisma.movingAverage.findFirst({
        orderBy: { createdAt: "desc" },
      });
      return movingAverage;
    } catch (error) {
      return handleError(error);
    }
  }
  async insert(movingAverage: MovingAverage): Promise<boolean | Error> {
    try {
      await prisma.movingAverage.create({
        data: {
          last365Days: movingAverage.last365Days,
          last30Days: movingAverage.last30Days,
        },
      });
      return true;
    } catch (error) {
      return handleError(error);
    }
  }

  async checkRowExistsByDate(dateUTC: string): Promise<boolean | Error> {
    try {
      const count = await prisma.movingAverage.count({
        where: {
          createdAt: {
            equals: new Date(dateUTC),
          },
        },
      });
      return count > 0;
    } catch (error) {
      return handleError(error);
    }
  }
}
