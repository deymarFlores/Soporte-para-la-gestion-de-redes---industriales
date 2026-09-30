import { type RealtimeGateway } from "./socketServer.js";
import { type AccessSessionResponseDTO } from "../../domain/remoteAccess/dtos/accessSessionResponse.dto.js";

/** Único responsable de anunciar cambios en sesiones de acceso remoto (inicio/fin/expiración). */
export class SessionsBroadcaster {
  constructor(private readonly gateway: RealtimeGateway) {}

  broadcastSessionStarted(session: AccessSessionResponseDTO): void {
    this.gateway.emit("sessions:update", { action: "started", session });
  }

  broadcastSessionEnded(session: AccessSessionResponseDTO): void {
    this.gateway.emit("sessions:update", { action: "ended", session });
  }
}
