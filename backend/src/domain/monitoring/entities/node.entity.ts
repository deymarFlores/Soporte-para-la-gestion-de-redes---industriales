import { NODE_TYPE, type NodeType } from "../valueObjects/nodeType.js";
import { NODE_STATUS, type NodeStatus } from "../valueObjects/nodeStatus.js";

export interface NodeEntityProps {
  id: string;
  name: string;
  type: NodeType;
  ip?: string | null;
  parentId?: string | null;
  agentToken?: string | null;
  currentStatus?: NodeStatus;
  lastHeartbeatAt?: Date | null;
  lastCheckedAt?: Date | null;
  createdAt?: Date;
  updatedAt?: Date;
}

export class NodeEntity {
  id: string;
  name: string;
  type: NodeType;
  ip: string | null;
  parentId: string | null;
  agentToken: string | null;
  currentStatus: NodeStatus;
  lastHeartbeatAt: Date | null;
  lastCheckedAt: Date | null;
  createdAt: Date;
  updatedAt: Date;

  constructor(props: NodeEntityProps) {
    if (!props.name) throw new Error("El nodo debe tener un nombre");
    if (!Object.values(NODE_TYPE).includes(props.type)) {
      throw new Error(`Tipo de nodo inválido: ${props.type}`);
    }

    this.id = props.id;
    this.name = props.name;
    this.type = props.type;
    this.ip = props.ip ?? null;
    this.parentId = props.parentId ?? null;
    this.agentToken = props.agentToken ?? null;
    this.currentStatus = props.currentStatus ?? NODE_STATUS.UNKNOWN;
    this.lastHeartbeatAt = props.lastHeartbeatAt ?? null;
    this.lastCheckedAt = props.lastCheckedAt ?? null;
    this.createdAt = props.createdAt ?? new Date();
    this.updatedAt = props.updatedAt ?? new Date();
  }

  get isGateway(): boolean {
    return this.type === NODE_TYPE.GATEWAY;
  }

  hasStatusChanged(newStatus: NodeStatus): boolean {
    return this.currentStatus !== newStatus;
  }

  applyStatus(newStatus: NodeStatus, checkedAt: Date = new Date()): void {
    this.currentStatus = newStatus;
    this.lastCheckedAt = checkedAt;
    this.updatedAt = checkedAt;
  }

  recordHeartbeat(at: Date = new Date()): void {
    this.lastHeartbeatAt = at;
    this.updatedAt = at;
  }
}
