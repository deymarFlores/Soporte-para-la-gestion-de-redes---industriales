import { type AccessSessionRepository, type AccessSessionListFilters } from "../repositories/accessSession.repository.js";
import { type UserRepository } from "../../auth/repositories/user.repository.js";
import { type NodeRepository } from "../../monitoring/repositories/node.repository.js";
import { enrichAccessSessions } from "./shared/enrichAccessSessions.js";
import { type AccessSessionResponseDTO } from "../../../domain/remoteAccess/dtos/accessSessionResponse.dto.js";

export default class ListSessionHistoryUseCase {
  constructor(
    private readonly accessSessionRepository: AccessSessionRepository,
    private readonly userRepository: UserRepository,
    private readonly nodeRepository: NodeRepository
  ) {}

  async execute(filters: AccessSessionListFilters): Promise<AccessSessionResponseDTO[]> {
    const sessions = await this.accessSessionRepository.findMany(filters);
    return enrichAccessSessions(sessions, this.userRepository, this.nodeRepository);
  }
}
