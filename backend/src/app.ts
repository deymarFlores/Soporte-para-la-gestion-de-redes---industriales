import express from "express";
import cors from "cors";
import http from "node:http";
import { env } from "./config/env.js";
import { buildRoutes } from "./interfaces/routes.js";
import { RealtimeGateway } from "./infrastructure/realtime/socketServer.js";
import { MonitoringDependencies } from "./interfaces/monitoring/dependencies.js";
import { startHeartbeatCheckJob } from "./infrastructure/monitoring/jobs/heartbeatCheck.job.js";

const HEARTBEAT_CHECK_INTERVAL_MS = 30_000;

const app = express();
app.use(cors({ origin: env.corsOrigin }));
app.use(express.json());

const httpServer = http.createServer(app);
const realtime = new RealtimeGateway(httpServer, env.corsOrigin);

app.get("/health", (_req, res) => {
  res.json({ status: "ok" });
});

app.use("/api", buildRoutes(realtime));

startHeartbeatCheckJob(MonitoringDependencies.createCheckHeartbeatsUseCase(), realtime, HEARTBEAT_CHECK_INTERVAL_MS);

httpServer.listen(env.port, () => {
  console.log(`Backend escuchando en el puerto ${env.port}`);
});
