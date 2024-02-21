import express, { Request, Response } from "express";
import { router as serviceRouter } from "../service/service_provider/router";
import helmet from "helmet";
import cors from 'cors'; 
import * as dotenv from "dotenv";
dotenv.config();

export async function runServer() {
  try {
    const app = express();
    const port: string = process.env.SERVER_PORT;
    const serverPath: string = process.env.SERVER_PATH;
    app.use(cors());
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
