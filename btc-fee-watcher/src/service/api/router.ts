import { Router } from "express";
import {
  handleGetFeeEstimateHistory,
  handleGetIndex,
  handleGetIndexDetailedHistory,
  handleGetIndexHistory,
  handleGetMovingAverageHistory,
} from "./dto";
import * as dotenv from "dotenv";
dotenv.config();

export const router = Router();
export const alertStreamPath = "index";

// Middleware for API key authentication
const authenticateAPIKey = (req, res, next) => {
  const apiKey = req.headers["x-api-key"];

  if (apiKey == null) return res.sendStatus(401);
  if (apiKey !== process.env.API_KEY) return res.sendStatus(403);
  next();
};

router.get(
  "/index",
  //authenticateAPIKey,
  handleGetIndex,
);

router.get(
  "/history",
  //authenticateAPIKey,
  handleGetIndexDetailedHistory,
);

router.get(
  "/indexHistory",
  authenticateAPIKey,
  handleGetIndexHistory,
);

router.get(
  "/movingAverageHistory",
  authenticateAPIKey,
  handleGetMovingAverageHistory,
);
router.get(
  "/feeEstimateHistory",
  authenticateAPIKey,
  handleGetFeeEstimateHistory,
);
