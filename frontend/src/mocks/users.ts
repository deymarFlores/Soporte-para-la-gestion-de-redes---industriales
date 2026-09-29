import type { AuthUser } from "../types/auth.js";

/**
 * Usuarios de demostración: el backend todavía no tiene autenticación ni permisos por
 * dispositivo, así que login y autorización se simulan aquí. El estado real de los equipos
 * (arriba/caído) sí viene del backend — solo el "quién puede ver/hacer qué" está mockeado.
 */
export const MOCK_USERS: (AuthUser & { password: string })[] = [
  {
    id: "u-admin-1",
    name: "Carla Méndez",
    email: "admin@planta.com",
    password: "admin123",
    role: "ADMINISTRADOR",
    allowedDeviceIps: ["192.168.2.10"],
  },
  {
    id: "u-soporte-1",
    name: "Diego Fernández",
    email: "soporte@planta.com",
    password: "soporte123",
    role: "SOPORTE",
    allowedDeviceIps: ["192.168.2.10"],
  },
  {
    id: "u-consulta-1",
    name: "Elena Rojas",
    email: "consulta@planta.com",
    password: "consulta123",
    role: "CONSULTA",
  },
];

export function findUserByCredentials(email: string, password: string): AuthUser | null {
  const match = MOCK_USERS.find(
    (user) => user.email.toLowerCase() === email.trim().toLowerCase() && user.password === password
  );
  if (!match) return null;

  const { password: _password, ...user } = match;
  return user;
}
