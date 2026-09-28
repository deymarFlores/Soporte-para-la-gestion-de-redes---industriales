import { Router } from "express";
import { MonitoringDependencies } from "./dependencies.js";
import { type RealtimeGateway } from "../../infrastructure/realtime/socketServer.js";

export class MonitoringRouter {
  static routes(realtime: RealtimeGateway): Router {
    const router = Router();
    const controller = MonitoringDependencies.createController(realtime);

    router.post("/agent/report", controller.reportStatus);
    router.get("/dashboard/summary", controller.getDashboardSummary);
    router.get("/incidents", controller.listIncidents);

    return router;
  }
}
