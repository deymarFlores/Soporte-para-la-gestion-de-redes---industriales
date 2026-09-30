import { type IncidentType } from "../valueObjects/incidentType.js";
import { type IncidentStatus } from "../valueObjects/incidentStatus.js";

export interface IncidentResponseDTO {
  id: string;
  nodeId: string;
  type: IncidentType;
  status: IncidentStatus;
  rootIncidentId: string | null;
  startedAt: string;
  resolvedAt: string | null;
  durationSeconds: number | null;
}
