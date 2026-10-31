export interface Container {
  id: string;
  name: string;
  image: string;
  status: "running" | "stopped";
  ports: string[];
  volumes: string[];
  cpu: number;
  memory: number;
}

export interface Pod {
  name: string;
  deployment: string;
  status: "Running" | "Pending";
  restarts: number;
  age: string;
  node: string;
  cpu: number;
  memory: number;
}

export interface MetricPoint {
  time: string;
  cpu: number;
  memory: number;
}

export interface MonitorService {
  name: string;
  status: "operational" | "degraded";
  uptime: string;
  latency: number;
}

export interface Alert {
  id: string;
  level: "info" | "warning" | "critical";
  title: string;
  detail: string;
  time: string;
}

export interface DatabaseHealth {
  status: "up" | "down";
  latency: number | null;
  connections: number | null;
  sizeMb: number | null;
}

export interface DashboardData {
  mode: "demo";
  uptime: number;
  containers: Container[];
  pods: Pod[];
  metrics: MetricPoint[];
  monitoring: { services: MonitorService[]; alerts: Alert[] };
  database: DatabaseHealth;
}

export interface Setting {
  id: number;
  name: string;
  type: "alert" | "discord_webhook" | "metric_threshold" | "service";
  value: string;
  active: boolean;
}
