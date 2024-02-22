import { runServer } from "./infra/server";
import { runIndexWatcher } from "./infra/index_watcher";
import { PrismaClient } from "@prisma/client";

export const prisma = new PrismaClient();

async function startService() {
  try {
    await runServer();
    //ideally, index watch and ws handling should be uncoupled for safety.
    await runIndexWatcher();
  } catch (error) {
    console.error(`Error running Service:${error}`);
    await prisma.$disconnect();
    process.exit(1);
  }
}

startService();
