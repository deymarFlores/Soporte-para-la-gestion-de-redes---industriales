import { type Request, type Response } from "express";
import { type AuthService } from "./services.js";
import { InvalidCredentialsError } from "../../application/auth/useCases/login.useCase.js";
import { EmailAlreadyExistsError } from "../../application/auth/useCases/createUser.useCase.js";
import { UserNotFoundError } from "../../application/auth/useCases/updateUser.useCase.js";
import { UserInUseError } from "../../application/auth/useCases/deleteUser.useCase.js";

export class AuthController {
  constructor(private readonly authService: AuthService) {}

  login = async (req: Request, res: Response): Promise<void> => {
    try {
      const { email, password } = req.body ?? {};
      if (!email || !password) {
        res.status(400).json({ success: false, error: "Correo y contraseña son requeridos" });
        return;
      }
      const result = await this.authService.login(email, password);
      res.json({ success: true, data: result });
    } catch (error) {
      if (error instanceof InvalidCredentialsError) {
        res.status(401).json({ success: false, error: error.message });
        return;
      }
      res.status(500).json({ success: false, error: (error as Error).message });
    }
  };

  listUsers = async (_req: Request, res: Response): Promise<void> => {
    try {
      const users = await this.authService.listUsers();
      res.json({ success: true, data: users });
    } catch (error) {
      res.status(500).json({ success: false, error: (error as Error).message });
    }
  };

  createUser = async (req: Request, res: Response): Promise<void> => {
    try {
      const user = await this.authService.createUser(req.body);
      res.status(201).json({ success: true, data: user });
    } catch (error) {
      if (error instanceof EmailAlreadyExistsError) {
        res.status(409).json({ success: false, error: error.message });
        return;
      }
      res.status(400).json({ success: false, error: (error as Error).message });
    }
  };

  updateUser = async (req: Request, res: Response): Promise<void> => {
    try {
      const user = await this.authService.updateUser(req.params["id"] as string, req.body);
      res.json({ success: true, data: user });
    } catch (error) {
      if (error instanceof UserNotFoundError) {
        res.status(404).json({ success: false, error: error.message });
        return;
      }
      res.status(400).json({ success: false, error: (error as Error).message });
    }
  };

  deleteUser = async (req: Request, res: Response): Promise<void> => {
    try {
      await this.authService.deleteUser(req.params["id"] as string);
      res.json({ success: true, data: null });
    } catch (error) {
      if (error instanceof UserNotFoundError) {
        res.status(404).json({ success: false, error: error.message });
        return;
      }
      if (error instanceof UserInUseError) {
        res.status(409).json({ success: false, error: error.message });
        return;
      }
      res.status(400).json({ success: false, error: (error as Error).message });
    }
  };
}
