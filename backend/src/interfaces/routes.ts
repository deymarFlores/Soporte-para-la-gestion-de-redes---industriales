import { Router } from "express";
import { MonitoringRouter } from "./monitoring/router.js";
import { SiteRouter } from "./sites/router.js";
import { AuthRouter } from "./auth/router.js";
import { RemoteAccessRouter } from "./remoteAccess/router.js";
import { type MonitoringBroadcaster } from "../infrastructure/realtime/MonitoringBroadcaster.js";
import { type TopologyBroadcaster } from "../infrastructure/realtime/TopologyBroadcaster.js";
import { type SessionsBroadcaster } from "../infrastructure/realtime/SessionsBroadcaster.js";

export interface Broadcasters {
  monitoring: MonitoringBroadcaster;
  topology: TopologyBroadcaster;
  sessions: SessionsBroadcaster;
}

export function buildRoutes(broadcasters: Broadcasters): Router {
  const router = Router();
  router.use("/", AuthRouter.routes());
  router.use("/", MonitoringRouter.routes(broadcasters.monitoring, broadcasters.topology));
  router.use("/", SiteRouter.routes());
  router.use("/", RemoteAccessRouter.routes(broadcasters.sessions));
  return router;
}
