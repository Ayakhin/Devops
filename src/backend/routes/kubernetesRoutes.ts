import { Router } from "express";
import { getPodLogs, getPods, scale } from "../controllers/kubernetesController";

const router = Router();

router.get("/pods", getPods);
router.get("/pods/:name/logs", getPodLogs);
router.put("/deployments/:name/scale", scale);

export default router;
