import { Router } from "express";
import { handleGetIndex, handleGetIndexHistory } from "./dto";
export const router = Router();

export const alertStreamPath = "index";

router.get("/index", handleGetIndex);
router.get("/indexHistory", handleGetIndexHistory);


