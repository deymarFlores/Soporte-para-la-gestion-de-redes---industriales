import { Router } from "express";
import { RemoteAccessDependencies } from "./dependencies.js";
import { authMiddleware } from "../../infrastructure/auth/middlewares/auth.middleware.js";
import { USER_ROLE } from "../../domain/auth/valueObjects/userRole.js";
import { type SessionsBroadcaster } from "../../infrastructure/realtime/SessionsBroadcaster.js";

export class RemoteAccessRouter {
  static routes(sessionsBroadcaster: SessionsBroadcaster): Router {
    const router = Router();
    const controller = RemoteAccessDependencies.createController(sessionsBroadcaster);
    const canUseRemoteAccess = [USER_ROLE.ADMINISTRADOR, USER_ROLE.SOPORTE] as const;

    router.post("/acceso-remoto/solicitar", authMiddleware(...canUseRemoteAccess), controller.requestAccess);
    router.post("/acceso-remoto/sesiones/:id/finalizar", authMiddleware(...canUseRemoteAccess), controller.endSession);
    router.get("/acceso-remoto/sesiones", authMiddleware(...canUseRemoteAccess), controller.listActive);
    router.get("/acceso-remoto/historial", authMiddleware(...canUseRemoteAccess), controller.listHistory);

    return router;
  }
}
