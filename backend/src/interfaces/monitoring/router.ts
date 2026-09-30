import { Router } from "express";
import { MonitoringDependencies } from "./dependencies.js";
import { type MonitoringBroadcaster } from "../../infrastructure/realtime/MonitoringBroadcaster.js";
import { type TopologyBroadcaster } from "../../infrastructure/realtime/TopologyBroadcaster.js";
import { authMiddleware } from "../../infrastructure/auth/middlewares/auth.middleware.js";
import { USER_ROLE } from "../../domain/auth/valueObjects/userRole.js";

export class MonitoringRouter {
  static routes(monitoringBroadcaster: MonitoringBroadcaster, topologyBroadcaster: TopologyBroadcaster): Router {
    const router = Router();
    const controller = MonitoringDependencies.createController(monitoringBroadcaster, topologyBroadcaster);

    router.post("/agent/report", controller.reportStatus);
    router.get("/dashboard/summary", controller.getDashboardSummary);
    router.get("/incidents", controller.listIncidents);

    router.get("/equipos", authMiddleware(), controller.listNodes);
    router.post("/equipos", authMiddleware(USER_ROLE.ADMINISTRADOR), controller.createNode);
    router.put("/equipos/:id", authMiddleware(USER_ROLE.ADMINISTRADOR), controller.updateNode);
    router.delete("/equipos/:id", authMiddleware(USER_ROLE.ADMINISTRADOR), controller.deleteNode);

    router.get("/tramos", authMiddleware(), controller.listSegments);
    router.post("/tramos", authMiddleware(USER_ROLE.ADMINISTRADOR), controller.createSegment);
    router.put("/tramos/:id", authMiddleware(USER_ROLE.ADMINISTRADOR), controller.updateSegment);
    router.delete("/tramos/:id", authMiddleware(USER_ROLE.ADMINISTRADOR), controller.deleteSegment);

    return router;
  }
}
