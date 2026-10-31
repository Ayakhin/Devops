import { Router } from "express";
import { getDatabaseStatus } from "../controllers/databaseController";

const router = Router();

router.get("/health", getDatabaseStatus);

export default router;
