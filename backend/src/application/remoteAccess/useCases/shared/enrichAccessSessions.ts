import { type UserRepository } from "../../../auth/repositories/user.repository.js";
import { type NodeRepository } from "../../../monitoring/repositories/node.repository.js";
import { type AccessSessionEntity } from "../../../../domain/remoteAccess/entities/accessSession.entity.js";
import { AccessSessionMapper } from "../../../../domain/remoteAccess/mappers/accessSession.mapper.js";
import { type AccessSessionResponseDTO } from "../../../../domain/remoteAccess/dtos/accessSessionResponse.dto.js";

export async function enrichAccessSessions(
  sessions: AccessSessionEntity[],
  userRepository: UserRepository,
  nodeRepository: NodeRepository
): Promise<AccessSessionResponseDTO[]> {
  const results: AccessSessionResponseDTO[] = [];
  for (const session of sessions) {
    const [user, node] = await Promise.all([
      userRepository.findById(session.userId),
      nodeRepository.findById(session.nodeId),
    ]);
    results.push(AccessSessionMapper.toResponseDTO(session, user?.name ?? "Desconocido", node?.name ?? "Desconocido"));
  }
  return results;
}
