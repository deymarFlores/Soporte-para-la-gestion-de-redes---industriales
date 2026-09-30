import { Router } from "express";
import { SiteDependencies } from "./dependencies.js";
import { authMiddleware } from "../../infrastructure/auth/middlewares/auth.middleware.js";
import { USER_ROLE } from "../../domain/auth/valueObjects/userRole.js";

export class SiteRouter {
  static routes(): Router {
    const router = Router();
    const controller = SiteDependencies.createController();

    router.get("/sitios", authMiddleware(), controller.list);
    router.post("/sitios", authMiddleware(USER_ROLE.ADMINISTRADOR), controller.create);
    router.put("/sitios/:id", authMiddleware(USER_ROLE.ADMINISTRADOR), controller.update);
    router.delete("/sitios/:id", authMiddleware(USER_ROLE.ADMINISTRADOR), controller.delete);

    return router;
  }
}
