import { ACCESS_SESSION_STATUS, type AccessSessionStatus } from "../valueObjects/accessSessionStatus.js";

export interface AccessSessionEntityProps {
  id?: string;
  userId: string;
  nodeId: string;
  reason: string;
  maxDurationSeconds: number;
  status?: AccessSessionStatus;
  startedAt?: Date;
  endedAt?: Date | null;
}

export class AccessSessionEntity {
  id: string | undefined;
  userId: string;
  nodeId: string;
  reason: string;
  maxDurationSeconds: number;
  status: AccessSessionStatus;
  startedAt: Date;
  endedAt: Date | null;

  constructor(props: AccessSessionEntityProps) {
    if (!props.userId) throw new Error("La sesión debe tener un usuario");
    if (!props.nodeId) throw new Error("La sesión debe tener un equipo");
    if (!props.reason) throw new Error("La sesión debe indicar un motivo de acceso");
    if (props.maxDurationSeconds <= 0) throw new Error("La duración máxima debe ser positiva");

    this.id = props.id;
    this.userId = props.userId;
    this.nodeId = props.nodeId;
    this.reason = props.reason;
    this.maxDurationSeconds = props.maxDurationSeconds;
    this.status = props.status ?? ACCESS_SESSION_STATUS.ACTIVE;
    this.startedAt = props.startedAt ?? new Date();
    this.endedAt = props.endedAt ?? null;
  }

  get isActive(): boolean {
    return this.status === ACCESS_SESSION_STATUS.ACTIVE;
  }

  get isExpired(): boolean {
    if (!this.isActive) return false;
    const elapsedSeconds = (Date.now() - this.startedAt.getTime()) / 1000;
    return elapsedSeconds > this.maxDurationSeconds;
  }

  end(status: Exclude<AccessSessionStatus, "ACTIVE">, at: Date = new Date()): void {
    if (!this.isActive) return;
    this.status = status;
    this.endedAt = at;
  }
}
