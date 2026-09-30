import { type SiteEntity } from "../entities/site.entity.js";
import { type SiteResponseDTO } from "../dtos/siteResponse.dto.js";

export class SiteMapper {
  static toResponseDTO(entity: SiteEntity): SiteResponseDTO {
    return {
      id: entity.id as string,
      name: entity.name,
      location: entity.location,
      description: entity.description,
      enabled: entity.enabled,
      createdAt: entity.createdAt.toISOString(),
      updatedAt: entity.updatedAt.toISOString(),
    };
  }

  static toResponseDTOArray(entities: SiteEntity[]): SiteResponseDTO[] {
    return entities.map((entity) => SiteMapper.toResponseDTO(entity));
  }
}
