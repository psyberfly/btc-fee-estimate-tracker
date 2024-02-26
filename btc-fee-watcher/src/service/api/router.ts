import { Router } from "express";
import { handleGetIndex, handleGetIndexHistory, handleGetFeeEstimateHistory } from "./dto";
export const router = Router();

export const alertStreamPath = "index";

router.get("/index", handleGetIndex);
router.get("/indexHistory", handleGetIndexHistory);
router.get("/feeEstimateHistory", handleGetFeeEstimateHistory);


