export interface SiteResponseDTO {
  id: string;
  name: string;
  location: string | null;
  description: string | null;
  enabled: boolean;
  createdAt: string;
  updatedAt: string;
}
