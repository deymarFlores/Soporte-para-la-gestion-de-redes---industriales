export type NodeType = "GATEWAY" | "PLC" | "DEVICE";
export type NodeStatus = "UP" | "DOWN" | "UNKNOWN";
export type IncidentType = "INDIVIDUAL" | "DEPENDENT" | "HEARTBEAT_TIMEOUT";
export type IncidentStatus = "ACTIVE" | "RESOLVED";

export interface NodeResponseDTO {
  id: string;
  name: string;
  type: NodeType;
  ip: string | null;
  parentId: string | null;
  currentStatus: NodeStatus;
  lastHeartbeatAt: string | null;
  lastCheckedAt: string | null;
}

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

export interface DashboardSummaryDTO {
  nodes: NodeResponseDTO[];
  activeIncidents: IncidentResponseDTO[];
}

export interface MonitoringUpdateEvent {
  updatedNodes: NodeResponseDTO[];
  openedIncidents: IncidentResponseDTO[];
  resolvedIncidents: IncidentResponseDTO[];
}
