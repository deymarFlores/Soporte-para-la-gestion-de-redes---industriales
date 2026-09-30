import prisma from "../../infrastructure/database/prismaClient.js";
import { MonitoringService } from "./services.js";
import { MonitoringController } from "./controller.js";
import PrismaNodeRepository from "../../infrastructure/monitoring/repositories/NodeRepository.Impl.js";
import PrismaStatusEventRepository from "../../infrastructure/monitoring/repositories/StatusEventRepository.Impl.js";
import PrismaIncidentRepository from "../../infrastructure/monitoring/repositories/IncidentRepository.Impl.js";
import PrismaSegmentRepository from "../../infrastructure/monitoring/repositories/SegmentRepository.Impl.js";
import ReportStatusUseCase from "../../application/monitoring/useCases/reportStatus.useCase.js";
import GetDashboardSummaryUseCase from "../../application/monitoring/useCases/getDashboardSummary.useCase.js";
import ListIncidentsUseCase from "../../application/monitoring/useCases/listIncidents.useCase.js";
import ListNodesUseCase from "../../application/monitoring/useCases/listNodes.useCase.js";
import CreateNodeUseCase from "../../application/monitoring/useCases/createNode.useCase.js";
import UpdateNodeUseCase from "../../application/monitoring/useCases/updateNode.useCase.js";
import DeleteNodeUseCase from "../../application/monitoring/useCases/deleteNode.useCase.js";
import ListSegmentsUseCase from "../../application/monitoring/useCases/listSegments.useCase.js";
import CreateSegmentUseCase from "../../application/monitoring/useCases/createSegment.useCase.js";
import UpdateSegmentUseCase from "../../application/monitoring/useCases/updateSegment.useCase.js";
import DeleteSegmentUseCase from "../../application/monitoring/useCases/deleteSegment.useCase.js";
import CheckHeartbeatsUseCase from "../../application/monitoring/useCases/checkHeartbeats.useCase.js";
import { type MonitoringBroadcaster } from "../../infrastructure/realtime/MonitoringBroadcaster.js";
import { type TopologyBroadcaster } from "../../infrastructure/realtime/TopologyBroadcaster.js";
import { env } from "../../config/env.js";

export class MonitoringDependencies {
  static createController(monitoringBroadcaster: MonitoringBroadcaster, topologyBroadcaster: TopologyBroadcaster): MonitoringController {
    const nodeRepository = new PrismaNodeRepository(prisma);
    const statusEventRepository = new PrismaStatusEventRepository(prisma);
    const incidentRepository = new PrismaIncidentRepository(prisma);
    const segmentRepository = new PrismaSegmentRepository(prisma);

    const monitoringService = new MonitoringService({
      reportStatusUseCase: new ReportStatusUseCase(nodeRepository, statusEventRepository, incidentRepository),
      getDashboardSummaryUseCase: new GetDashboardSummaryUseCase(nodeRepository, incidentRepository),
      listIncidentsUseCase: new ListIncidentsUseCase(incidentRepository),
      listNodesUseCase: new ListNodesUseCase(nodeRepository),
      createNodeUseCase: new CreateNodeUseCase(nodeRepository),
      updateNodeUseCase: new UpdateNodeUseCase(nodeRepository),
      deleteNodeUseCase: new DeleteNodeUseCase(nodeRepository),
      listSegmentsUseCase: new ListSegmentsUseCase(segmentRepository),
      createSegmentUseCase: new CreateSegmentUseCase(segmentRepository, nodeRepository),
      updateSegmentUseCase: new UpdateSegmentUseCase(segmentRepository, nodeRepository),
      deleteSegmentUseCase: new DeleteSegmentUseCase(segmentRepository, nodeRepository),
    });

    return new MonitoringController(monitoringService, monitoringBroadcaster, topologyBroadcaster);
  }

  static createCheckHeartbeatsUseCase(): CheckHeartbeatsUseCase {
    const nodeRepository = new PrismaNodeRepository(prisma);
    const incidentRepository = new PrismaIncidentRepository(prisma);
    return new CheckHeartbeatsUseCase(nodeRepository, incidentRepository, env.heartbeatTimeoutSeconds);
  }
}
