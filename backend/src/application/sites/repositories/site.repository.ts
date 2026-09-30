import { type SiteEntity } from "../../../domain/sites/entities/site.entity.js";

export interface SiteRepository {
  create(site: SiteEntity): Promise<SiteEntity>;
  update(site: SiteEntity): Promise<SiteEntity>;
  delete(id: string): Promise<void>;
  findById(id: string): Promise<SiteEntity | null>;
  findAll(): Promise<SiteEntity[]>;
}
