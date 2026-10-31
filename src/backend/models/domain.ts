export type ContainerStatus = "running" | "stopped";
export type Environment = "dev" | "prod";

export interface ContainerSummary {
  id: string;
  name: string;
  image: string;
  status: ContainerStatus;
  ports: string[];
  volumes: string[];
  cpu: number;
  memory: number;
}

export interface PodSummary {
  name: string;
  deployment: string;
  status: "Running" | "Pending";
  restarts: number;
  age: string;
  node: string;
  cpu: number;
  memory: number;
}

export interface Setting {
  id: number;
  name: string;
  type: "alert" | "discord_webhook" | "metric_threshold" | "service";
  value: string;
  active: boolean;
}
