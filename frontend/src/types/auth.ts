export type Role = "ADMIN" | "ENGINEER";

export interface AuthUser {
  id: string;
  name: string;
  email: string;
  role: Role;
  allowedDeviceIps?: string[];
}
