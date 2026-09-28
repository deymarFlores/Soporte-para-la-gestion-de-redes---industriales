import prisma from "../../infrastructure/database/prismaClient.js";
import { MonitoringService } from "./services.js";
import { MonitoringController } from "./controller.js";
import PrismaNodeRepository from "../../infrastructure/monitoring/repositories/NodeRepository.Impl.js";
import PrismaStatusEventRepository from "../../infrastructure/monitoring/repositories/StatusEventRepository.Impl.js";
import PrismaIncidentRepository from "../../infrastructure/monitoring/repositories/IncidentRepository.Impl.js";
import ReportStatusUseCase from "../../application/monitoring/useCases/reportStatus.useCase.js";
import GetDashboardSummaryUseCase from "../../application/monitoring/useCases/getDashboardSummary.useCase.js";
import ListIncidentsUseCase from "../../application/monitoring/useCases/listIncidents.useCase.js";
import CheckHeartbeatsUseCase from "../../application/monitoring/useCases/checkHeartbeats.useCase.js";
import { type RealtimeGateway } from "../../infrastructure/realtime/socketServer.js";
import { env } from "../../config/env.js";

export class MonitoringDependencies {
  static createController(realtime: RealtimeGateway): MonitoringController {
    const nodeRepository = new PrismaNodeRepository(prisma);
    const statusEventRepository = new PrismaStatusEventRepository(prisma);
    const incidentRepository = new PrismaIncidentRepository(prisma);

    const monitoringService = new MonitoringService({
      reportStatusUseCase: new ReportStatusUseCase(nodeRepository, statusEventRepository, incidentRepository),
      getDashboardSummaryUseCase: new GetDashboardSummaryUseCase(nodeRepository, incidentRepository),
      listIncidentsUseCase: new ListIncidentsUseCase(incidentRepository),
    });

    return new MonitoringController(monitoringService, realtime);
  }

  static createCheckHeartbeatsUseCase(): CheckHeartbeatsUseCase {
    const nodeRepository = new PrismaNodeRepository(prisma);
    const incidentRepository = new PrismaIncidentRepository(prisma);
    return new CheckHeartbeatsUseCase(nodeRepository, incidentRepository, env.heartbeatTimeoutSeconds);
  }
}
