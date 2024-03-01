import { MovingAverage } from "@prisma/client";
import { prisma } from "../../../main";
import { handleError } from "../../../lib/errors/e";

export class MovingAveragePrismaStore {
  async readAll(since?: Date): Promise<MovingAverage[] | Error> {
    try {
      // Initialize the query parameters with orderBy
      let queryParameters: any = {
        orderBy: { createdAt: "desc" },
      };

      console.log({since});

      // If since is provided, add a where clause to the query parameters
      if (since) {
        queryParameters.where = {
          createdAt: {
            gt: since, // Use the "gt" (greater than) operator to filter records after the "since" date
          },
        };
      }

      const allMovAvgRes = await prisma.movingAverage.findMany(queryParameters);

      return allMovAvgRes;
    } catch (error) {
      return handleError(error);
    }
  }

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
