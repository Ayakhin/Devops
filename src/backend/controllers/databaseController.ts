import type { Request, Response } from "express";
import { getDatabaseHealth } from "../services/databaseService";

export async function getDatabaseStatus(_request: Request, response: Response): Promise<void> {
  const health = await getDatabaseHealth();
  response.status(health.status === "up" ? 200 : 503).json(health);
}
