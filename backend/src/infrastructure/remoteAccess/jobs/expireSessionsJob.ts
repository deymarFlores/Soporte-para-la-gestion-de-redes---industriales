import type ExpireOverdueSessionsUseCase from "../../../application/remoteAccess/useCases/expireOverdueSessions.useCase.js";
import { type SessionsBroadcaster } from "../../realtime/SessionsBroadcaster.js";
import { type UserRepository } from "../../../application/auth/repositories/user.repository.js";
import { type NodeRepository } from "../../../application/monitoring/repositories/node.repository.js";
import { AccessSessionMapper } from "../../../domain/remoteAccess/mappers/accessSession.mapper.js";

export function startExpireSessionsJob(
  useCase: ExpireOverdueSessionsUseCase,
  broadcaster: SessionsBroadcaster,
  userRepository: UserRepository,
  nodeRepository: NodeRepository,
  intervalMs: number
): NodeJS.Timeout {
  return setInterval(() => {
    useCase
      .execute()
      .then(async (expiredSessions) => {
        for (const session of expiredSessions) {
          const [user, node] = await Promise.all([
            userRepository.findById(session.userId),
            nodeRepository.findById(session.nodeId),
          ]);
          broadcaster.broadcastSessionEnded(
            AccessSessionMapper.toResponseDTO(session, user?.name ?? "Desconocido", node?.name ?? "Desconocido")
          );
        }
      })
      .catch((error) => {
        console.error("Error expirando sesiones de acceso remoto:", error);
      });
  }, intervalMs);
}
