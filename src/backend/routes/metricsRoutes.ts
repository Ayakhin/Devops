import { Router } from "express";
import { getMetricsHistory } from "../controllers/metricsController";

const router = Router();

router.get("/", getMetricsHistory);

export default router;
