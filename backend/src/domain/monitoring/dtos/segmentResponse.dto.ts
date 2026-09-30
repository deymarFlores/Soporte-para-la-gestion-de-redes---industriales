export interface SegmentResponseDTO {
  id: string;
  name: string;
  originId: string;
  destinationId: string;
  connectionType: string;
  monitoringMethod: string;
  checkIntervalSeconds: number;
  latencyThresholdMs: number;
  packetLossThresholdPct: number;
  enabled: boolean;
  createdAt: string;
  updatedAt: string;
}
