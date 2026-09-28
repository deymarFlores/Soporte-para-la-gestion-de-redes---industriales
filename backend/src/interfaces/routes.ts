import { Router } from "express";
import { MonitoringRouter } from "./monitoring/router.js";
import { type RealtimeGateway } from "../infrastructure/realtime/socketServer.js";

export function buildRoutes(realtime: RealtimeGateway): Router {
  const router = Router();
  router.use("/", MonitoringRouter.routes(realtime));
  return router;
}
