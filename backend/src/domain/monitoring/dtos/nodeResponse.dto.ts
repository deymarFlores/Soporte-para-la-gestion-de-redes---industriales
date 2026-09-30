import { type NodeType } from "../valueObjects/nodeType.js";
import { type NodeStatus } from "../valueObjects/nodeStatus.js";

export interface NodeResponseDTO {
  id: string;
  name: string;
  type: NodeType;
  ip: string | null;
  parentId: string | null;
  siteId: string | null;
  description: string | null;
  monitoringParams: string | null;
  enabled: boolean;
  remoteAccessEnabled: boolean;
  currentStatus: NodeStatus;
  lastHeartbeatAt: string | null;
  lastCheckedAt: string | null;
}
