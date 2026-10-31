import type { Request, Response } from "express";
import { getMetrics, parseEnvironment } from "../services/demoService";

export function getMetricsHistory(request: Request, response: Response): void {
  const environment = parseEnvironment(request.query.environment);
  response.json({ data: getMetrics(environment), retentionHours: 24, mode: "demo" });
}
