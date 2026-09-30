import { Prisma, type PrismaClient, type User as UserRow } from "@prisma/client";
import { type UserRepository } from "../../../application/auth/repositories/user.repository.js";
import { UserEntity } from "../../../domain/auth/entities/user.entity.js";
import type { UserRole } from "../../../domain/auth/valueObjects/userRole.js";
import { UserInUseError } from "../../../application/auth/useCases/deleteUser.useCase.js";

function toEntity(row: UserRow): UserEntity {
  return new UserEntity({
    id: row.id,
    name: row.name,
    email: row.email,
    passwordHash: row.passwordHash,
    role: row.role as UserRole,
    enabled: row.enabled,
    lastLoginAt: row.lastLoginAt,
    createdAt: row.createdAt,
    updatedAt: row.updatedAt,
  });
}

export default class PrismaUserRepository implements UserRepository {
  constructor(private readonly prisma: PrismaClient) {}

  async create(user: UserEntity): Promise<UserEntity> {
    const row = await this.prisma.user.create({
      data: {
        name: user.name,
        email: user.email,
        passwordHash: user.passwordHash,
        role: user.role,
        enabled: user.enabled,
      },
    });
    return toEntity(row);
  }

  async update(user: UserEntity): Promise<UserEntity> {
    const row = await this.prisma.user.update({
      where: { id: user.id },
      data: {
        name: user.name,
        email: user.email,
        passwordHash: user.passwordHash,
        role: user.role,
        enabled: user.enabled,
        lastLoginAt: user.lastLoginAt,
      },
    });
    return toEntity(row);
  }

  async delete(id: string): Promise<void> {
    try {
      await this.prisma.user.delete({ where: { id } });
    } catch (error) {
      if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === "P2003") {
        throw new UserInUseError("No se puede eliminar un usuario con historial de accesos; deshabilítalo en su lugar");
      }
      throw error;
    }
  }

  async findById(id: string): Promise<UserEntity | null> {
    const row = await this.prisma.user.findUnique({ where: { id } });
    return row ? toEntity(row) : null;
  }

  async findByEmail(email: string): Promise<UserEntity | null> {
    const row = await this.prisma.user.findUnique({ where: { email } });
    return row ? toEntity(row) : null;
  }

  async findAll(): Promise<UserEntity[]> {
    const rows = await this.prisma.user.findMany({ orderBy: { createdAt: "asc" } });
    return rows.map(toEntity);
  }

  async getAllowedDeviceIds(userId: string): Promise<string[]> {
    const grants = await this.prisma.userDeviceAccess.findMany({ where: { userId }, select: { nodeId: true } });
    return grants.map((grant) => grant.nodeId);
  }

  async setAllowedDeviceIds(userId: string, nodeIds: string[]): Promise<void> {
    await this.prisma.$transaction([
      this.prisma.userDeviceAccess.deleteMany({ where: { userId } }),
      this.prisma.userDeviceAccess.createMany({
        data: nodeIds.map((nodeId) => ({ userId, nodeId })),
        skipDuplicates: true,
      }),
    ]);
  }
}
