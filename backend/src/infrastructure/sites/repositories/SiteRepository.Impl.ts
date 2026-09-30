import { Prisma, type PrismaClient, type Site as SiteRow } from "@prisma/client";
import { type SiteRepository } from "../../../application/sites/repositories/site.repository.js";
import { SiteEntity } from "../../../domain/sites/entities/site.entity.js";
import { SiteInUseError } from "../../../application/sites/useCases/deleteSite.useCase.js";

function toEntity(row: SiteRow): SiteEntity {
  return new SiteEntity({
    id: row.id,
    name: row.name,
    location: row.location,
    description: row.description,
    enabled: row.enabled,
    createdAt: row.createdAt,
    updatedAt: row.updatedAt,
  });
}

export default class PrismaSiteRepository implements SiteRepository {
  constructor(private readonly prisma: PrismaClient) {}

  async create(site: SiteEntity): Promise<SiteEntity> {
    const row = await this.prisma.site.create({
      data: {
        name: site.name,
        location: site.location,
        description: site.description,
        enabled: site.enabled,
      },
    });
    return toEntity(row);
  }

  async update(site: SiteEntity): Promise<SiteEntity> {
    const row = await this.prisma.site.update({
      where: { id: site.id },
      data: {
        name: site.name,
        location: site.location,
        description: site.description,
        enabled: site.enabled,
      },
    });
    return toEntity(row);
  }

  async delete(id: string): Promise<void> {
    try {
      await this.prisma.site.delete({ where: { id } });
    } catch (error) {
      if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === "P2003") {
        throw new SiteInUseError("No se puede eliminar un sitio con equipos asignados");
      }
      throw error;
    }
  }

  async findById(id: string): Promise<SiteEntity | null> {
    const row = await this.prisma.site.findUnique({ where: { id } });
    return row ? toEntity(row) : null;
  }

  async findAll(): Promise<SiteEntity[]> {
    const rows = await this.prisma.site.findMany({ orderBy: { createdAt: "asc" } });
    return rows.map(toEntity);
  }
}
