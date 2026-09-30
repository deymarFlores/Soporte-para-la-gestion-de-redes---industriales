import type { Server as HttpServer } from "node:http";
import { Server as SocketIOServer } from "socket.io";

/**
 * Transporte puro: solo sabe abrir el socket y emitir eventos con nombre.
 * No conoce nada de monitoreo, topología ni sesiones — eso lo deciden los
 * *Broadcaster de cada módulo (ver infrastructure/realtime/*Broadcaster.ts).
 */
export class RealtimeGateway {
  private readonly io: SocketIOServer;

  constructor(httpServer: HttpServer, corsOrigin: string) {
    this.io = new SocketIOServer(httpServer, { cors: { origin: corsOrigin } });
  }

  emit(event: string, payload: unknown): void {
    this.io.emit(event, payload);
  }
}
