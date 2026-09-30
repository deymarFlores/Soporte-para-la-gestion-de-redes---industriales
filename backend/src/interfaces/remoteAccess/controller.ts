import { type Request, type Response } from "express";
import { type RemoteAccessService } from "./services.js";
import { type SessionsBroadcaster } from "../../infrastructure/realtime/SessionsBroadcaster.js";
import {
  NotAuthorizedForDeviceError,
  DeviceUnavailableError,
  RemoteAccessNotEnabledError,
  DeviceAlreadyInUseError,
} from "../../application/remoteAccess/useCases/requestAccess.useCase.js";
import {
  SessionNotFoundError,
  SessionAlreadyEndedError,
} from "../../application/remoteAccess/useCases/endSession.useCase.js";

export class RemoteAccessController {
  constructor(
    private readonly remoteAccessService: RemoteAccessService,
    private readonly sessionsBroadcaster: SessionsBroadcaster
  ) {}

  requestAccess = async (req: Request, res: Response): Promise<void> => {
    try {
      if (!req.authUser) {
        res.status(401).json({ success: false, error: "No autenticado" });
        return;
      }

      const { nodeId, reason, maxDurationSeconds } = req.body ?? {};
      const session = await this.remoteAccessService.requestAccess({
        userId: req.authUser.sub,
        nodeId,
        reason,
        maxDurationSeconds: maxDurationSeconds ?? 1200,
      });

      this.sessionsBroadcaster.broadcastSessionStarted(session);
      res.status(201).json({ success: true, data: session });
    } catch (error) {
      if (error instanceof NotAuthorizedForDeviceError || error instanceof RemoteAccessNotEnabledError) {
        res.status(403).json({ success: false, error: error.message });
        return;
      }
      if (error instanceof DeviceUnavailableError || error instanceof DeviceAlreadyInUseError) {
        res.status(409).json({ success: false, error: error.message });
        return;
      }
      res.status(400).json({ success: false, error: (error as Error).message });
    }
  };

  endSession = async (req: Request, res: Response): Promise<void> => {
    try {
      const session = await this.remoteAccessService.endSession(req.params["id"] as string);
      this.sessionsBroadcaster.broadcastSessionEnded(session);
      res.json({ success: true, data: session });
    } catch (error) {
      if (error instanceof SessionNotFoundError) {
        res.status(404).json({ success: false, error: error.message });
        return;
      }
      if (error instanceof SessionAlreadyEndedError) {
        res.status(409).json({ success: false, error: error.message });
        return;
      }
      res.status(400).json({ success: false, error: (error as Error).message });
    }
  };

  listActive = async (_req: Request, res: Response): Promise<void> => {
    try {
      const sessions = await this.remoteAccessService.listActive();
      res.json({ success: true, data: sessions });
    } catch (error) {
      res.status(500).json({ success: false, error: (error as Error).message });
    }
  };

  listHistory = async (req: Request, res: Response): Promise<void> => {
    try {
      const { userId, nodeId, status } = req.query;
      const sessions = await this.remoteAccessService.listHistory({
        userId: typeof userId === "string" ? userId : undefined,
        nodeId: typeof nodeId === "string" ? nodeId : undefined,
        status: typeof status === "string" ? status : undefined,
      });
      res.json({ success: true, data: sessions });
    } catch (error) {
      res.status(500).json({ success: false, error: (error as Error).message });
    }
  };
}
