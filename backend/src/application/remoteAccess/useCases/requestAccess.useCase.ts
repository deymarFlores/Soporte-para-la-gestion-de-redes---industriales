import { type AccessSessionRepository } from "../repositories/accessSession.repository.js";
import { type NodeRepository } from "../../monitoring/repositories/node.repository.js";
import { type UserRepository } from "../../auth/repositories/user.repository.js";
import { AccessSessionEntity } from "../../../domain/remoteAccess/entities/accessSession.entity.js";
import { NODE_STATUS } from "../../../domain/monitoring/valueObjects/nodeStatus.js";

export interface RequestAccessInput {
  userId: string;
  nodeId: string;
  reason: string;
  maxDurationSeconds: number;
}

export class NotAuthorizedForDeviceError extends Error {}
export class DeviceUnavailableError extends Error {}
export class RemoteAccessNotEnabledError extends Error {}
export class DeviceAlreadyInUseError extends Error {}

/**
 * Valida, en orden: el equipo existe y admite acceso remoto, está disponible (UP),
 * el usuario tiene autorización explícita sobre él, y no hay ya otra sesión activa
 * ocupándolo — recién entonces abre la sesión.
 */
export default class RequestAccessUseCase {
  constructor(
    private readonly accessSessionRepository: AccessSessionRepository,
    private readonly nodeRepository: NodeRepository,
    private readonly userRepository: UserRepository
  ) {}

  async execute(input: RequestAccessInput): Promise<AccessSessionEntity> {
    const node = await this.nodeRepository.findById(input.nodeId);
    if (!node) throw new DeviceUnavailableError("El equipo no existe");

    if (!node.remoteAccessEnabled) throw new RemoteAccessNotEnabledError("Este equipo no permite acceso remoto");
    if (node.currentStatus !== NODE_STATUS.UP) throw new DeviceUnavailableError("El equipo no está disponible");

    const allowedDeviceIds = await this.userRepository.getAllowedDeviceIds(input.userId);
    if (!allowedDeviceIds.includes(input.nodeId)) {
      throw new NotAuthorizedForDeviceError("No tienes autorización para acceder a este equipo");
    }

    const existingActive = await this.accessSessionRepository.findActiveByNodeId(input.nodeId);
    if (existingActive) throw new DeviceAlreadyInUseError("Ya existe una sesión activa sobre este equipo");

    const session = new AccessSessionEntity({
      userId: input.userId,
      nodeId: input.nodeId,
      reason: input.reason,
      maxDurationSeconds: input.maxDurationSeconds,
    });

    return this.accessSessionRepository.create(session);
  }
}
