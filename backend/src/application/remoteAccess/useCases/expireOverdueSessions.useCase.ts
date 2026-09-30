import { type AccessSessionRepository } from "../repositories/accessSession.repository.js";
import { type AccessSessionEntity } from "../../../domain/remoteAccess/entities/accessSession.entity.js";
import { ACCESS_SESSION_STATUS } from "../../../domain/remoteAccess/valueObjects/accessSessionStatus.js";

/** Igual patrón que CheckHeartbeatsUseCase: un job periódico cierra lo que se pasó de tiempo. */
export default class ExpireOverdueSessionsUseCase {
  constructor(private readonly accessSessionRepository: AccessSessionRepository) {}

  async execute(): Promise<AccessSessionEntity[]> {
    const active = await this.accessSessionRepository.findAllActive();
    const expired: AccessSessionEntity[] = [];

    for (const session of active) {
      if (!session.isExpired) continue;
      session.end(ACCESS_SESSION_STATUS.EXPIRED);
      expired.push(await this.accessSessionRepository.update(session));
    }

    return expired;
  }
}
