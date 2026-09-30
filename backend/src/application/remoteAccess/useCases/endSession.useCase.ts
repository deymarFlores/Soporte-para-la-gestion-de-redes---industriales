import { type AccessSessionRepository } from "../repositories/accessSession.repository.js";
import { type AccessSessionEntity } from "../../../domain/remoteAccess/entities/accessSession.entity.js";
import { ACCESS_SESSION_STATUS } from "../../../domain/remoteAccess/valueObjects/accessSessionStatus.js";

export class SessionNotFoundError extends Error {}
export class SessionAlreadyEndedError extends Error {}

export default class EndSessionUseCase {
  constructor(private readonly accessSessionRepository: AccessSessionRepository) {}

  async execute(id: string): Promise<AccessSessionEntity> {
    const session = await this.accessSessionRepository.findById(id);
    if (!session) throw new SessionNotFoundError(`Sesión ${id} no encontrada`);
    if (!session.isActive) throw new SessionAlreadyEndedError("La sesión ya no está activa");

    session.end(ACCESS_SESSION_STATUS.ENDED);
    return this.accessSessionRepository.update(session);
  }
}
