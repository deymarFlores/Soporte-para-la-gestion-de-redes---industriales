import express from "express";
import cors from "cors";
import http from "node:http";
import { env } from "./config/env.js";
import { buildRoutes } from "./interfaces/routes.js";
import { RealtimeGateway } from "./infrastructure/realtime/socketServer.js";
import { MonitoringBroadcaster } from "./infrastructure/realtime/MonitoringBroadcaster.js";
import { TopologyBroadcaster } from "./infrastructure/realtime/TopologyBroadcaster.js";
import { SessionsBroadcaster } from "./infrastructure/realtime/SessionsBroadcaster.js";
import { MonitoringDependencies } from "./interfaces/monitoring/dependencies.js";
import { RemoteAccessDependencies } from "./interfaces/remoteAccess/dependencies.js";
import { startHeartbeatCheckJob } from "./infrastructure/monitoring/jobs/heartbeatCheck.job.js";
import { startExpireSessionsJob } from "./infrastructure/remoteAccess/jobs/expireSessionsJob.js";

const HEARTBEAT_CHECK_INTERVAL_MS = 30_000;

const app = express();
app.use(cors({ origin: env.corsOrigin }));
app.use(express.json());

const httpServer = http.createServer(app);
const realtimeGateway = new RealtimeGateway(httpServer, env.corsOrigin);

const broadcasters = {
  monitoring: new MonitoringBroadcaster(realtimeGateway),
  topology: new TopologyBroadcaster(realtimeGateway),
  sessions: new SessionsBroadcaster(realtimeGateway),
};

app.get("/health", (_req, res) => {
  res.json({ status: "ok" });
});

app.use("/api", buildRoutes(broadcasters));

startHeartbeatCheckJob(
  MonitoringDependencies.createCheckHeartbeatsUseCase(),
  broadcasters.monitoring,
  HEARTBEAT_CHECK_INTERVAL_MS
);

startExpireSessionsJob(
  RemoteAccessDependencies.createExpireSessionsUseCase(),
  broadcasters.sessions,
  RemoteAccessDependencies.createUserRepository(),
  RemoteAccessDependencies.createNodeRepository(),
  env.accessSessionCleanupIntervalMs
);

httpServer.listen(env.port, () => {
  console.log(`Backend escuchando en el puerto ${env.port}`);
});
