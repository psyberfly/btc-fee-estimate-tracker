import { MovingAverages } from "@prisma/client";
import { prisma } from "../../../main";
import { handleError } from "../../../lib/errors/e";

export class MovingAveragePrismaStore {
  async readAll(since?: Date, isHistoric?:boolean): Promise<MovingAverages[] | Error> {
    try {
      // Initialize the query parameters with orderBy
      let queryParameters: any = {
        orderBy: { day: "asc" },
      };

      // If since is provided, add a where clause to the query parameters
      if (since) {
        queryParameters.where = {
          day: {
            gte: since, // Use the "gt" (greater than) operator to filter records after the "since" date
          },
        };
      }

      if(isHistoric){
        queryParameters.select = {day:true,last30Days:true,last365Days:true};
      }

      const allMovAvgRes = await prisma.movingAverages.findMany(
        queryParameters,
      );

      return allMovAvgRes;
    } catch (error) {
      return handleError(error);
    }
  }

  async readLatest(): Promise<MovingAverages | Error> {
    try {
      const movingAverage = await prisma.movingAverages.findFirst({
        orderBy: { createdAt: "asc" },
      });
      return movingAverage;
    } catch (error) {
      return handleError(error);
    }
  }
  async insert(movingAverages: MovingAverages): Promise<boolean | Error> {
    try {
      await prisma.movingAverages.create({
        data: {
          day: movingAverages.day,
          last365Days: movingAverages.last365Days,
          last30Days: movingAverages.last30Days,
        },
      });
      return true;
    } catch (error) {
      return handleError(error);
    }
  }

  async readByDay(day: Date): Promise<MovingAverages | Error> {
    try {
      const startOfDay = new Date(day);
      startOfDay.setHours(0, 0, 0, 0);

      const endOfDay = new Date(day);
      endOfDay.setHours(23, 59, 59, 999);

      const movingAverage = await prisma.movingAverages.findFirst({
        where: {
          day: {
            gte: startOfDay, // Greater than or equal to the start of the day
            lte: endOfDay, // Less than or equal to the end of the day
          },
        },
      });
      return movingAverage;
    } catch (error) {
      return handleError(error);
    }
  }
  async checkRowExistsByDate(dateUTC: string): Promise<boolean | Error> {
    try {
      const count = await prisma.movingAverages.count({
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
