import { type AccessSessionStatus } from "../valueObjects/accessSessionStatus.js";

export interface AccessSessionResponseDTO {
  id: string;
  userId: string;
  userName: string;
  nodeId: string;
  nodeName: string;
  reason: string;
  maxDurationSeconds: number;
  status: AccessSessionStatus;
  startedAt: string;
  endedAt: string | null;
}
