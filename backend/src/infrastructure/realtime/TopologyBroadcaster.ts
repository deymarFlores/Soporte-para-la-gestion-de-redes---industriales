import { type RealtimeGateway } from "./socketServer.js";

export type TopologyEntityKind = "site" | "node" | "segment";
export type TopologyChangeAction = "created" | "updated" | "deleted";

export interface TopologyChangePayload {
  kind: TopologyEntityKind;
  action: TopologyChangeAction;
  id: string;
}

/** Único responsable de anunciar cambios administrativos a la topología (sitios/equipos/tramos). */
export class TopologyBroadcaster {
  constructor(private readonly gateway: RealtimeGateway) {}

  broadcastChange(payload: TopologyChangePayload): void {
    this.gateway.emit("topology:update", payload);
  }
}
