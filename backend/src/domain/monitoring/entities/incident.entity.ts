import { INCIDENT_STATUS, type IncidentStatus } from "../valueObjects/incidentStatus.js";
import { type IncidentType } from "../valueObjects/incidentType.js";

export interface IncidentEntityProps {
  id?: string;
  nodeId: string;
  type: IncidentType;
  status?: IncidentStatus;
  rootIncidentId?: string | null;
  startedAt?: Date;
  resolvedAt?: Date | null;
  durationSeconds?: number | null;
}

export class IncidentEntity {
  id: string | undefined;
  nodeId: string;
  type: IncidentType;
  status: IncidentStatus;
  rootIncidentId: string | null;
  startedAt: Date;
  resolvedAt: Date | null;
  durationSeconds: number | null;

  constructor(props: IncidentEntityProps) {
    if (!props.nodeId) throw new Error("El incidente debe tener un nodo asociado");

    this.id = props.id;
    this.nodeId = props.nodeId;
    this.type = props.type;
    this.status = props.status ?? INCIDENT_STATUS.ACTIVE;
    this.rootIncidentId = props.rootIncidentId ?? null;
    this.startedAt = props.startedAt ?? new Date();
    this.resolvedAt = props.resolvedAt ?? null;
    this.durationSeconds = props.durationSeconds ?? null;
  }

  get isActive(): boolean {
    return this.status === INCIDENT_STATUS.ACTIVE;
  }

  resolve(at: Date = new Date()): void {
    if (!this.isActive) return;
    this.status = INCIDENT_STATUS.RESOLVED;
    this.resolvedAt = at;
    this.durationSeconds = Math.max(0, Math.round((at.getTime() - this.startedAt.getTime()) / 1000));
  }
}
