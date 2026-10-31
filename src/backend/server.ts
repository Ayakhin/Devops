import { createServer } from "node:http";
import "dotenv/config";
import express from "express";
import { WebSocket, WebSocketServer } from "ws";
import containerRoutes from "./routes/containerRoutes";
import dashboardRoutes from "./routes/dashboardRoutes";
import databaseRoutes from "./routes/databaseRoutes";
import kubernetesRoutes from "./routes/kubernetesRoutes";
import metricsRoutes from "./routes/metricsRoutes";
import monitoringRoutes from "./routes/monitoringRoutes";
import settingsRoutes from "./routes/settingsRoutes";
import { initializeDatabase } from "./models/database";
import { getContainer } from "./services/demoService";

const app = express();
const server = createServer(app);
const webSocketServer = new WebSocketServer({ noServer: true });

app.use(express.json({ limit: "32kb" }));
app.get("/api/health", (_request, response) => response.json({ status: "up", mode: "demo" }));
app.use("/api/dashboard", dashboardRoutes);
app.use("/api/database", databaseRoutes);
app.use("/api/metrics", metricsRoutes);
app.use("/api/containers", containerRoutes);
app.use("/api/kubernetes", kubernetesRoutes);
app.use("/api/monitoring", monitoringRoutes);
app.use("/api/settings", settingsRoutes);
app.use((request, response) => response.status(404).json({ error: `Route inconnue : ${request.method} ${request.path}` }));
app.use((error: unknown, _request: express.Request, response: express.Response, _next: express.NextFunction) => {
  const status = typeof error === "object" && error !== null && "status" in error ? Number(error.status) : 500;
  const message = error instanceof Error ? error.message : "Erreur interne du serveur.";
  if (status >= 500) console.error("Erreur API :", error);
  response.status(status).json({ error: message });
});

function streamLogs(connection: WebSocket, containerId: string): void {
  const messages = [
    "INFO  service démarré, attente des requêtes",
    "INFO  vérification de santé : OK",
    "DEBUG connexion au pool de données établie",
    "INFO  requête traitée en 42 ms",
    "WARN  latence supérieure au seuil de 200 ms",
  ];
  let index = 0;
  connection.send(`${new Date().toISOString()}  INFO  flux de logs ouvert pour ${containerId}`);
  const interval = setInterval(() => {
    if (connection.readyState === WebSocket.OPEN) {
      connection.send(`${new Date().toISOString()}  ${messages[index++ % messages.length]}`);
    }
  }, 1400);
  connection.on("close", () => clearInterval(interval));
}

server.on("upgrade", (request, socket, head) => {
  const url = new URL(request.url ?? "/", "http://localhost");
  const containerId = url.searchParams.get("containerId");
  if (url.pathname !== "/ws" || !containerId || !getContainer(containerId)) {
    socket.write("HTTP/1.1 404 Not Found\r\n\r\n");
    socket.destroy();
    return;
  }
  webSocketServer.handleUpgrade(request, socket, head, (connection) => {
    webSocketServer.emit("connection", connection, request);
    streamLogs(connection, containerId);
  });
});

const port = Number(process.env.PORT ?? 5000);
server.listen(port, () => {
  console.log(`API DevOps disponible sur http://localhost:${port}`);
  initializeDatabase().catch((error: unknown) => {
    console.error("Initialisation MySQL impossible ; les routes dépendantes de la base resteront indisponibles.", error);
  });
});
