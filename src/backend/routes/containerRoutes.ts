import { Router } from "express";
import { controlContainer, getContainers } from "../controllers/containerController";

const router = Router();

router.get("/", getContainers);
router.post("/:id/:action", controlContainer);

export default router;
