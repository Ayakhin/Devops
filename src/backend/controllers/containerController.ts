import type { Request, Response } from "express";
import { listContainers, parseEnvironment, updateContainer } from "../services/demoService";

export function getContainers(request: Request, response: Response): void {
  const environment = parseEnvironment(request.query.environment);
  response.json({ data: listContainers(environment), mode: "demo" });
}

export function controlContainer(request: Request, response: Response): void {
  const { action } = request.params;
  const environment = parseEnvironment(request.query.environment);
  if (!["start", "stop", "restart", "remove"].includes(action)) {
    response.status(400).json({ error: "Action de conteneur non prise en charge." });
    return;
  }
  response.json({ data: updateContainer(request.params.id, action as "start" | "stop" | "restart" | "remove", environment) });
}
