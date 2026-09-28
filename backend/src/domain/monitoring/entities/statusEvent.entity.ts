import { type NodeStatus } from "../valueObjects/nodeStatus.js";

export interface StatusEventEntityProps {
  id?: string;
  nodeId: string;
  status: NodeStatus;
  latencyMs?: number | null;
  packetLossPct?: number | null;
  metadata?: Record<string, unknown> | null;
  source: string;
  occurredAt?: Date;
}

export class StatusEventEntity {
  id: string | undefined;
  nodeId: string;
  status: NodeStatus;
  latencyMs: number | null;
  packetLossPct: number | null;
  metadata: Record<string, unknown> | null;
  source: string;
  occurredAt: Date;

  constructor(props: StatusEventEntityProps) {
    if (!props.nodeId) throw new Error("El evento de estado debe tener un nodo asociado");
    if (!props.source) throw new Error("El evento de estado debe indicar su origen (explicit/heartbeat)");

    this.id = props.id;
    this.nodeId = props.nodeId;
    this.status = props.status;
    this.latencyMs = props.latencyMs ?? null;
    this.packetLossPct = props.packetLossPct ?? null;
    this.metadata = props.metadata ?? null;
    this.source = props.source;
    this.occurredAt = props.occurredAt ?? new Date();
  }
}
