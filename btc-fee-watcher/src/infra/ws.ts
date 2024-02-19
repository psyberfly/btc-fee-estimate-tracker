import express from "express";
import { Server as WebSocketServer } from "ws";
import { TEN_MINUTES_MS } from "../lib/time/time";
import { alertStreamPath } from "../service/service_provider/router";
import http from "http";
import * as dotenv from "dotenv";
import { handleError } from "../lib/errors/e";
import { FeeIndex } from "@prisma/client";
import { IndexResponse } from "../op/fee_index/interface";
dotenv.config();

export class AlertStreamServer {
  private port: string;
  private path: string;
  private static alertStreamServer: WebSocketServer;

  constructor(port: string, path: string) {
    this.port = port;
    this.path = path;
    AlertStreamServer.initAlertStream(this.port, this.path);
  }

  private static initAlertStream(port: string, path: string) {
    try {
      const app = express();
      const server = http.createServer(app);

      AlertStreamServer.alertStreamServer = new WebSocketServer({
        server,
        path,
      });

      function broadcastAlert(data: string) {
        AlertStreamServer.alertStreamServer.clients.forEach((client) => {
          client.send(data);
        });
      }

      AlertStreamServer.alertStreamServer.on("connection", (client, req) => {
        console.log("WS connection opened");
        const servicePath = req.url.split("?service=")[1];
        //Currently we broadcast to all subscribers if they stream to the offered service, since only 1 service is offered.
        //When upgrading to multiple services, attach tag to the client: client["service"]="index" and filter by tag in broadcastAlert
        if (servicePath !== alertStreamPath) {
          client.send(
            "Error: 404; Message: Service not found. Please check the service you want to stream.",
          );
          client.close();
        }

        client.send(
          "Hello from BTC Fee Watcher! You are now streaming our index...",
        );
        client.on("message", (message) => {
          console.log("WS message received:", message.toString());
        });
        client.on("error", (message) => {
          console.error("WS connection error:", message);
        });
        client.on("close", (message: any) => {
          console.log("WS connection closed");
        });
      });

      AlertStreamServer.alertStreamServer.on("error", (error) => {
        console.error("WS Error:", error);
      });

      server.listen(port, () => {
        console.log(`WS Server running on port ${port}`);
      });
    } catch (error) {
      console.error("Error starting WS Server:", error);
      process.exit(1);
    }
  }

  public broadcastAlert(data: IndexResponse): boolean | Error {
    try {
      // Broadcast to all connected clients
      AlertStreamServer.alertStreamServer.clients.forEach((client) => {
        client.send(JSON.stringify(data));
      });
    } catch (e) {
      console.error("AlertStreamServer: Error during broadcast!");
      return handleError(e);
    }

    return true;
  }
}
