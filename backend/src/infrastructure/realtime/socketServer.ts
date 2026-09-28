import type { Server as HttpServer } from "node:http";
import { Server as SocketIOServer } from "socket.io";

export class RealtimeGateway {
  private readonly io: SocketIOServer;

  constructor(httpServer: HttpServer, corsOrigin: string) {
    this.io = new SocketIOServer(httpServer, { cors: { origin: corsOrigin } });
  }

  broadcastMonitoringUpdate(payload: unknown): void {
    this.io.emit("monitoring:update", payload);
  }
}
