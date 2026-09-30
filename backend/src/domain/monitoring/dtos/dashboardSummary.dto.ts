import { type NodeResponseDTO } from "./nodeResponse.dto.js";
import { type IncidentResponseDTO } from "./incidentResponse.dto.js";

export interface DashboardSummaryDTO {
  nodes: NodeResponseDTO[];
  activeIncidents: IncidentResponseDTO[];
}
