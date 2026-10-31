import { Router } from "express";
import { createSetting, deleteSetting, getSettings, updateSetting } from "../controllers/settingsController";

const router = Router();

router.get("/", getSettings);
router.post("/", createSetting);
router.put("/:id", updateSetting);
router.delete("/:id", deleteSetting);

export default router;
