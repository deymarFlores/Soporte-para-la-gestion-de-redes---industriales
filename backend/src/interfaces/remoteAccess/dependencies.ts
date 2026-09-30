import prisma from "../../infrastructure/database/prismaClient.js";
import { RemoteAccessService } from "./services.js";
import { RemoteAccessController } from "./controller.js";
import PrismaAccessSessionRepository from "../../infrastructure/remoteAccess/repositories/AccessSessionRepository.Impl.js";
import PrismaUserRepository from "../../infrastructure/auth/repositories/UserRepository.Impl.js";
import PrismaNodeRepository from "../../infrastructure/monitoring/repositories/NodeRepository.Impl.js";
import RequestAccessUseCase from "../../application/remoteAccess/useCases/requestAccess.useCase.js";
import EndSessionUseCase from "../../application/remoteAccess/useCases/endSession.useCase.js";
import ListActiveSessionsUseCase from "../../application/remoteAccess/useCases/listActiveSessions.useCase.js";
import ListSessionHistoryUseCase from "../../application/remoteAccess/useCases/listSessionHistory.useCase.js";
import ExpireOverdueSessionsUseCase from "../../application/remoteAccess/useCases/expireOverdueSessions.useCase.js";
import { type SessionsBroadcaster } from "../../infrastructure/realtime/SessionsBroadcaster.js";

export class RemoteAccessDependencies {
  static createController(sessionsBroadcaster: SessionsBroadcaster): RemoteAccessController {
    const accessSessionRepository = new PrismaAccessSessionRepository(prisma);
    const userRepository = new PrismaUserRepository(prisma);
    const nodeRepository = new PrismaNodeRepository(prisma);

    const service = new RemoteAccessService({
      requestAccessUseCase: new RequestAccessUseCase(accessSessionRepository, nodeRepository, userRepository),
      endSessionUseCase: new EndSessionUseCase(accessSessionRepository),
      listActiveSessionsUseCase: new ListActiveSessionsUseCase(accessSessionRepository, userRepository, nodeRepository),
      listSessionHistoryUseCase: new ListSessionHistoryUseCase(accessSessionRepository, userRepository, nodeRepository),
      userRepository,
      nodeRepository,
    });

    return new RemoteAccessController(service, sessionsBroadcaster);
  }

  static createExpireSessionsUseCase(): ExpireOverdueSessionsUseCase {
    return new ExpireOverdueSessionsUseCase(new PrismaAccessSessionRepository(prisma));
  }

  static createUserRepository(): PrismaUserRepository {
    return new PrismaUserRepository(prisma);
  }

  static createNodeRepository(): PrismaNodeRepository {
    return new PrismaNodeRepository(prisma);
  }
}
