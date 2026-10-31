import { Router } from "express";
import { getMonitoringStatus, testDiscordWebhook } from "../controllers/monitoringController";

const router = Router();

router.get("/", getMonitoringStatus);
router.post("/alerts/test", testDiscordWebhook);

export default router;
