import type { ContainerSummary, Environment, PodSummary } from "../models/domain";

const containerTemplates: ContainerSummary[] = [
  { id: "c1", name: "nginx-proxy", image: "nginx:1.27-alpine", status: "running", ports: ["80:80", "443:443"], volumes: ["./nginx:/etc/nginx"], cpu: 12.4, memory: 42 },
  { id: "c2", name: "api-gateway", image: "node:22-alpine", status: "running", ports: ["5000:5000"], volumes: ["api_data:/app/data"], cpu: 34.8, memory: 68 },
  { id: "c3", name: "redis-cache", image: "redis:7-alpine", status: "running", ports: ["6379:6379"], volumes: ["redis_data:/data"], cpu: 8.2, memory: 31 },
  { id: "c4", name: "worker-jobs", image: "node:22-alpine", status: "stopped", ports: [], volumes: ["jobs:/app/jobs"], cpu: 0, memory: 0 },
];

const podTemplates: PodSummary[] = [
  { name: "api-7d8f6c9b4-k2m4p", deployment: "api", status: "Running", restarts: 0, age: "2d 4h", node: "worker-01", cpu: 28, memory: 142 },
  { name: "api-7d8f6c9b4-q8x1n", deployment: "api", status: "Running", restarts: 2, age: "1d 12h", node: "worker-02", cpu: 34, memory: 168 },
  { name: "api-7d8f6c9b4-t5v9a", deployment: "api", status: "Running", restarts: 0, age: "18h", node: "worker-01", cpu: 19, memory: 126 },
  { name: "web-5c7b9d8f6-p3r2w", deployment: "web", status: "Running", restarts: 0, age: "4d 1h", node: "worker-03", cpu: 12, memory: 84 },
  { name: "web-5c7b9d8f6-m7n4k", deployment: "web", status: "Running", restarts: 1, age: "3d 8h", node: "worker-02", cpu: 16, memory: 92 },
  { name: "worker-6f4a2d8c1-z9x3b", deployment: "worker", status: "Pending", restarts: 4, age: "6h", node: "worker-03", cpu: 0, memory: 0 },
];

const environments: Record<Environment, { containers: ContainerSummary[]; replicas: Record<string, number> }> = {
  dev: {
    containers: containerTemplates.map((container) => ({ ...container, ports: [...container.ports], volumes: [...container.volumes] })),
    replicas: { api: 3, web: 2, worker: 1 },
  },
  prod: {
    containers: containerTemplates.map((container) => ({
      ...container,
      ports: [...container.ports],
      volumes: [...container.volumes],
      status: container.id === "c4" ? "running" : container.status,
      cpu: container.status === "running" ? Math.min(95, container.cpu + 8) : container.cpu,
      memory: container.status === "running" ? container.memory + 20 : container.memory,
    })),
    replicas: { api: 4, web: 3, worker: 2 },
  },
};

const startedAt = Date.now();

export function parseEnvironment(value: unknown): Environment {
  if (value === undefined || value === "dev") return "dev";
  if (value === "prod") return "prod";
  throw Object.assign(new Error("L’environnement doit être « dev » ou « prod »."), { status: 400 });
}

export function listContainers(environment: Environment = "dev"): ContainerSummary[] {
  return environments[environment].containers.map((container) => ({ ...container, ports: [...container.ports], volumes: [...container.volumes] }));
}

export function updateContainer(id: string, action: "start" | "stop" | "restart" | "remove", environment: Environment = "dev"): ContainerSummary[] {
  const containers = environments[environment].containers;
  const index = containers.findIndex((container) => container.id === id);
  if (index < 0) throw Object.assign(new Error("Conteneur introuvable."), { status: 404 });

  if (action === "remove") containers.splice(index, 1);
  else containers[index].status = action === "stop" ? "stopped" : "running";
  return listContainers(environment);
}

export function listDeployments(): string[] {
  return Object.keys(environments.dev.replicas);
}

export function listPods(environment: Environment = "dev"): PodSummary[] {
  return Object.entries(environments[environment].replicas).flatMap(([deployment, count]) => {
    const templates = podTemplates.filter((pod) => pod.deployment === deployment);
    return Array.from({ length: count }, (_, index) => {
      const template = templates[index % templates.length];
      return index < templates.length
        ? { ...template }
        : { ...template, name: `${deployment}-demo-${index + 1}`, age: "moins d’une minute", cpu: 0, memory: 0, status: "Pending" as const };
    });
  });
}

export function scaleDeployment(name: string, count: number, environment: Environment = "dev"): number {
  const replicas = environments[environment].replicas;
  if (!(name in replicas)) throw Object.assign(new Error("Déploiement introuvable."), { status: 404 });
  if (!Number.isInteger(count) || count < 0 || count > 10) {
    throw Object.assign(new Error("Le nombre de réplicas doit être compris entre 0 et 10."), { status: 400 });
  }
  replicas[name] = count;
  return replicas[name];
}

export function getContainer(id: string): ContainerSummary | undefined {
  return Object.values(environments).flatMap((environment) => environment.containers).find((container) => container.id === id);
}

export function getMetrics(environment: Environment = "dev"): Array<{ time: string; cpu: number; memory: number }> {
  const offset = environment === "prod" ? 9 : 0;
  return Array.from({ length: 24 }, (_, index) => {
    const date = new Date(Date.now() - (23 - index) * 60 * 60 * 1000);
    return {
      time: date.toLocaleTimeString("fr-FR", { hour: "2-digit", minute: "2-digit" }),
      cpu: Math.max(12, Math.min(82, 43 + offset + Math.sin(index / 2.4) * 18 + Math.cos(index / 3.7) * 11)),
      memory: Math.max(24, Math.min(91, 56 + offset + Math.sin(index / 3.2) * 13 + Math.cos(index / 4.1) * 7)),
    };
  });
}

export function getMonitoring(environment: Environment = "dev") {
  const isProduction = environment === "prod";
  return {
    services: [
      { name: "API Gateway", status: "operational", uptime: isProduction ? "99.99%" : "99.98%", latency: isProduction ? 31 : 42 },
      { name: "MySQL Primary", status: "operational", uptime: "99.95%", latency: isProduction ? 6 : 8 },
      { name: "Redis Cache", status: "operational", uptime: "99.99%", latency: 3 },
      { name: "Background Worker", status: isProduction ? "operational" : "degraded", uptime: isProduction ? "99.91%" : "98.42%", latency: isProduction ? 48 : 218 },
    ],
    alerts: [
      { id: "a1", level: "warning", title: "Utilisation CPU élevée", detail: "api-gateway a dépassé 80 % pendant 5 min", time: "Il y a 4 min" },
      { id: "a2", level: "info", title: "Déploiement terminé", detail: "worker-jobs · version 2.4.1", time: "Il y a 18 min" },
      { id: "a3", level: "critical", title: "Redémarrages pod détectés", detail: "worker-6f4a2d8c1-z9x3b · 4 redémarrages", time: "Il y a 32 min" },
    ],
  };
}

export function getUptimeSeconds(): number {
  return Math.floor((Date.now() - startedAt) / 1000);
}
