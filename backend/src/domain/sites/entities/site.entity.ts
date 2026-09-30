export interface SiteEntityProps {
  id?: string;
  name: string;
  location?: string | null;
  description?: string | null;
  enabled?: boolean;
  createdAt?: Date;
  updatedAt?: Date;
}

export class SiteEntity {
  id: string | undefined;
  name: string;
  location: string | null;
  description: string | null;
  enabled: boolean;
  createdAt: Date;
  updatedAt: Date;

  constructor(props: SiteEntityProps) {
    if (!props.name) throw new Error("El sitio debe tener un nombre");

    this.id = props.id;
    this.name = props.name;
    this.location = props.location ?? null;
    this.description = props.description ?? null;
    this.enabled = props.enabled ?? true;
    this.createdAt = props.createdAt ?? new Date();
    this.updatedAt = props.updatedAt ?? new Date();
  }
}
