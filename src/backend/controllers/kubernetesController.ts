import type { Request, Response } from "express";
import { listDeployments, listPods, parseEnvironment, scaleDeployment } from "../services/demoService";

export function getPods(request: Request, response: Response): void {
  const environment = parseEnvironment(request.query.environment);
  response.json({ data: listPods(environment), deployments: listDeployments(), mode: "demo" });
}

export function scale(request: Request, response: Response): void {
  const replicas = Number(request.body?.replicas);
  const environment = parseEnvironment(request.body?.environment);
  response.json({ deployment: request.params.name, replicas: scaleDeployment(request.params.name, replicas, environment) });
}

export function getPodLogs(request: Request, response: Response): void {
  const environment = parseEnvironment(request.query.environment);
  const pod = listPods(environment).find((item) => item.name === request.params.name);
  if (!pod) {
    response.status(404).json({ error: "Pod introuvable." });
    return;
  }
  response.json({
    data: [
      `${new Date().toISOString()} INFO démarrage du conteneur ${pod.name}`,
      `${new Date().toISOString()} INFO sonde de santé : OK`,
      `${new Date().toISOString()} INFO prêt à recevoir du trafic`,
    ],
  });
}
