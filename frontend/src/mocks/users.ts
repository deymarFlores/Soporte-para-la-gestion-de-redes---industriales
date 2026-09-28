import type { AuthUser } from "../types/auth.js";

/**
 * Usuarios de demostración: el backend todavía no tiene autenticación ni permisos por
 * dispositivo, así que login y autorización se simulan aquí. El estado real de los equipos
 * (arriba/caído) sí viene del backend — solo el "quién puede ver qué" está mockeado.
 */
export const MOCK_USERS: (AuthUser & { password: string })[] = [
  {
    id: "u-admin-1",
    name: "Carla Méndez",
    email: "admin@planta.com",
    password: "admin123",
    role: "ADMIN",
  },
  {
    id: "u-eng-1",
    name: "Diego Fernández",
    email: "ingeniero@planta.com",
    password: "ing123",
    role: "ENGINEER",
    allowedDeviceIps: ["192.168.2.10"],
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
