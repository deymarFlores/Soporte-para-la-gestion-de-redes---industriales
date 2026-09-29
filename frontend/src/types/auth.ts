export type Role = "ADMINISTRADOR" | "SOPORTE" | "CONSULTA";

export interface AuthUser {
  id: string;
  name: string;
  email: string;
  role: Role;
  allowedDeviceIps?: string[];
}

/** SOPORTE y ADMINISTRADOR pueden usar acceso remoto; CONSULTA solo observa. */
export function canUseRemoteAccess(role: Role): boolean {
  return role === "ADMINISTRADOR" || role === "SOPORTE";
}

/** Solo ADMINISTRADOR gestiona usuarios, sitios, equipos y tramos. */
export function canManageInfrastructure(role: Role): boolean {
  return role === "ADMINISTRADOR";
}
