import type { Request, Response } from "express";
import { sendTestAlert } from "../services/alertService";
import { getMonitoring, parseEnvironment } from "../services/demoService";

export function getMonitoringStatus(request: Request, response: Response): void {
  const environment = parseEnvironment(request.query.environment);
  response.json({ ...getMonitoring(environment), mode: "demo" });
}

export async function testDiscordWebhook(_request: Request, response: Response): Promise<void> {
  await sendTestAlert();
  response.json({ message: "Notification de test envoyée." });
}
