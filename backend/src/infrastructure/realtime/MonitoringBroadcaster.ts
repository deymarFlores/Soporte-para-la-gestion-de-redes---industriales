import { type RealtimeGateway } from "./socketServer.js";
import { type NodeResponseDTO } from "../../domain/monitoring/dtos/nodeResponse.dto.js";
import { type IncidentResponseDTO } from "../../domain/monitoring/dtos/incidentResponse.dto.js";

export interface MonitoringUpdatePayload {
  updatedNodes: NodeResponseDTO[];
  openedIncidents: IncidentResponseDTO[];
  resolvedIncidents: IncidentResponseDTO[];
}

/** Único responsable de anunciar cambios de estado de monitoreo (nodos/incidentes). */
export class MonitoringBroadcaster {
  constructor(private readonly gateway: RealtimeGateway) {}

  broadcastUpdate(payload: MonitoringUpdatePayload): void {
    this.gateway.emit("monitoring:update", payload);
  }
}
