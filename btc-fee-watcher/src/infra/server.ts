import express, { Request, Response } from "express";
//import { PgStore } from "./db";
import { router as serviceRouter } from "../service/service_provider/router";
import path from "path";
import helmet from "helmet";
import * as dotenv from "dotenv";
dotenv.config();

export async function runServer() {
  try {
    const app = express();
    const port: string = process.env.SERVER_PORT;
    const serverPath: string = process.env.SERVER_PATH;

    app.get("/", (req: Request, res: Response) => {
      res.send("Hello from BTC Fee Watcher!");
    });

    app.use(serverPath, serviceRouter);

    // Start the server
    app.listen(port, () => {
      console.log(`Server running on port ${port}`);
    });
  } catch (error) {
    console.error("Error starting server:", error);
    process.exit(1);
  }
}
//20:17:44 0|main  | /home/anorak/Anorak/SatoshiPortal/btc-fee-watcher/dist/infra
