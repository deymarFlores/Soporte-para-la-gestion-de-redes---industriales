import type RequestAccessUseCase from "../../application/remoteAccess/useCases/requestAccess.useCase.js";
import type { RequestAccessInput } from "../../application/remoteAccess/useCases/requestAccess.useCase.js";
import type EndSessionUseCase from "../../application/remoteAccess/useCases/endSession.useCase.js";
import type ListActiveSessionsUseCase from "../../application/remoteAccess/useCases/listActiveSessions.useCase.js";
import type ListSessionHistoryUseCase from "../../application/remoteAccess/useCases/listSessionHistory.useCase.js";
import type { AccessSessionListFilters } from "../../application/remoteAccess/repositories/accessSession.repository.js";
import { AccessSessionMapper } from "../../domain/remoteAccess/mappers/accessSession.mapper.js";
import type { AccessSessionResponseDTO } from "../../domain/remoteAccess/dtos/accessSessionResponse.dto.js";
import type { UserRepository } from "../../application/auth/repositories/user.repository.js";
import type { NodeRepository } from "../../application/monitoring/repositories/node.repository.js";

export interface RemoteAccessServiceDependencies {
  requestAccessUseCase: RequestAccessUseCase;
  endSessionUseCase: EndSessionUseCase;
  listActiveSessionsUseCase: ListActiveSessionsUseCase;
  listSessionHistoryUseCase: ListSessionHistoryUseCase;
  userRepository: UserRepository;
  nodeRepository: NodeRepository;
}

export class RemoteAccessService {
  constructor(private readonly deps: RemoteAccessServiceDependencies) {}

  private async toDTO(session: Awaited<ReturnType<RequestAccessUseCase["execute"]>>): Promise<AccessSessionResponseDTO> {
    const [user, node] = await Promise.all([
      this.deps.userRepository.findById(session.userId),
      this.deps.nodeRepository.findById(session.nodeId),
    ]);
    return AccessSessionMapper.toResponseDTO(session, user?.name ?? "Desconocido", node?.name ?? "Desconocido");
  }

  async requestAccess(input: RequestAccessInput): Promise<AccessSessionResponseDTO> {
    const session = await this.deps.requestAccessUseCase.execute(input);
    return this.toDTO(session);
  }

  async endSession(id: string): Promise<AccessSessionResponseDTO> {
    const session = await this.deps.endSessionUseCase.execute(id);
    return this.toDTO(session);
  }

  async listActive(): Promise<AccessSessionResponseDTO[]> {
    return this.deps.listActiveSessionsUseCase.execute();
  }

  async listHistory(filters: AccessSessionListFilters): Promise<AccessSessionResponseDTO[]> {
    return this.deps.listSessionHistoryUseCase.execute(filters);
  }
}
