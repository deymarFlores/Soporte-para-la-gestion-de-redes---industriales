import { type UserRole } from "../valueObjects/userRole.js";

export interface UserResponseDTO {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  enabled: boolean;
  lastLoginAt: string | null;
  allowedDeviceIds: string[];
}
