import { type NodeType } from "../valueObjects/nodeType.js";
import { type NodeStatus } from "../valueObjects/nodeStatus.js";

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
