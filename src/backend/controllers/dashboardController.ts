import type { Request, Response } from "express";
import { getDatabaseHealth } from "../services/databaseService";
import { getMetrics, getMonitoring, getUptimeSeconds, listContainers, listPods, parseEnvironment } from "../services/demoService";

export async function getDashboard(request: Request, response: Response): Promise<void> {
  const environment = parseEnvironment(request.query.environment);
  const database = await getDatabaseHealth();
  response.json({
    mode: "demo",
    environment,
    uptime: getUptimeSeconds(),
    containers: listContainers(environment),
    pods: listPods(environment),
    metrics: getMetrics(environment),
    monitoring: getMonitoring(environment),
    database,
  });
}
