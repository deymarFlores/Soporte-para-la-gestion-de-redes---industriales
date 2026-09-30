import { Router } from "express";
import { AuthDependencies } from "./dependencies.js";
import { authMiddleware } from "../../infrastructure/auth/middlewares/auth.middleware.js";
import { USER_ROLE } from "../../domain/auth/valueObjects/userRole.js";

export class AuthRouter {
  static routes(): Router {
    const router = Router();
    const controller = AuthDependencies.createController();

    router.post("/auth/login", controller.login);

    router.get("/usuarios", authMiddleware(USER_ROLE.ADMINISTRADOR), controller.listUsers);
    router.post("/usuarios", authMiddleware(USER_ROLE.ADMINISTRADOR), controller.createUser);
    router.put("/usuarios/:id", authMiddleware(USER_ROLE.ADMINISTRADOR), controller.updateUser);
    router.delete("/usuarios/:id", authMiddleware(USER_ROLE.ADMINISTRADOR), controller.deleteUser);

    return router;
  }
}
