export interface SegmentEntityProps {
  id?: string;
  name: string;
  originId: string;
  destinationId: string;
  connectionType?: string;
  monitoringMethod?: string;
  checkIntervalSeconds?: number;
  latencyThresholdMs?: number;
  packetLossThresholdPct?: number;
  enabled?: boolean;
  createdAt?: Date;
  updatedAt?: Date;
}

export class SegmentEntity {
  id: string | undefined;
  name: string;
  originId: string;
  destinationId: string;
  connectionType: string;
  monitoringMethod: string;
  checkIntervalSeconds: number;
  latencyThresholdMs: number;
  packetLossThresholdPct: number;
  enabled: boolean;
  createdAt: Date;
  updatedAt: Date;

  constructor(props: SegmentEntityProps) {
    if (!props.name) throw new Error("El tramo debe tener un nombre");
    if (!props.originId || !props.destinationId) throw new Error("El tramo debe tener origen y destino");
    if (props.originId === props.destinationId) {
      throw new Error("El origen y el destino de un tramo no pueden ser el mismo equipo");
    }

    this.id = props.id;
    this.name = props.name;
    this.originId = props.originId;
    this.destinationId = props.destinationId;
    this.connectionType = props.connectionType ?? "Ethernet";
    this.monitoringMethod = props.monitoringMethod ?? "ICMP";
    this.checkIntervalSeconds = props.checkIntervalSeconds ?? 30;
    this.latencyThresholdMs = props.latencyThresholdMs ?? 200;
    this.packetLossThresholdPct = props.packetLossThresholdPct ?? 5;
    this.enabled = props.enabled ?? true;
    this.createdAt = props.createdAt ?? new Date();
    this.updatedAt = props.updatedAt ?? new Date();
  }
}
