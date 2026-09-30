import { type Request, type Response, type NextFunction } from "express";
import jwt from "jsonwebtoken";
import { env } from "../../../config/env.js";
import type { UserRole } from "../../../domain/auth/valueObjects/userRole.js";

export interface AuthTokenPayload {
  sub: string;
  role: UserRole;
}

declare global {
  // eslint-disable-next-line @typescript-eslint/no-namespace
  namespace Express {
    interface Request {
      authUser?: AuthTokenPayload;
    }
  }
}

/**
 * authMiddleware() exige un token válido de cualquier rol.
 * authMiddleware("ADMINISTRADOR") exige además que el rol coincida.
 */
export function authMiddleware(...allowedRoles: UserRole[]) {
  return (req: Request, res: Response, next: NextFunction): void => {
    const header = req.header("authorization");
    if (!header?.startsWith("Bearer ")) {
      res.status(401).json({ success: false, error: "Falta el token de autenticación" });
      return;
    }

    try {
      const payload = jwt.verify(header.slice("Bearer ".length), env.jwtSecret) as AuthTokenPayload;
      if (allowedRoles.length > 0 && !allowedRoles.includes(payload.role)) {
        res.status(403).json({ success: false, error: "No tienes permiso para esta acción" });
        return;
      }
      req.authUser = payload;
      next();
    } catch {
      res.status(401).json({ success: false, error: "Token inválido o expirado" });
    }
  };
}
