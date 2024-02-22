import express, { Request, Response } from "express";
import { router as serviceRouter } from "../service/api/router";
import helmet from "helmet";
import cors from "cors";
import * as dotenv from "dotenv";
dotenv.config();

export async function runServer() {
  try {
    const app = express();
    const port: string = process.env.SERVER_PORT;
    const baseApiRoute = "/api/v1";
    //used for btc-fee-watcher 
    app.use(cors());
    app.use(baseApiRoute, serviceRouter);

    app.get("/", (req: Request, res: Response) => {
      res.redirect(baseApiRoute);
    });
    app.get("/api/v1", (req: Request, res: Response) => {
      res.send("Hello from BTC Fee Watcher!");
    });

    app.listen(port, () => {
      console.log(`Server running on http://localhost:${port}${baseApiRoute}`);
    });
  } catch (error) {
    console.error("Error starting server:", error);
    process.exit(1);
  }
}
