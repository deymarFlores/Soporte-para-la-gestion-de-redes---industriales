import { createContext, useContext, useState, type ReactNode } from "react";
import type { AuthUser, Role } from "../types/auth.js";
import { generateId } from "../utils/id.js";

export interface UserRecord {
  id: string;
  name: string;
  email: string;
  password: string;
  role: Role;
  allowedDeviceIps: string[];
  habilitado: boolean;
  ultimoAcceso: string | null;
  createdAt: string;
}

export type UserInput = Omit<UserRecord, "id" | "createdAt" | "ultimoAcceso">;

interface UsersContextValue {
  users: UserRecord[];
  authenticate: (email: string, password: string) => AuthUser | null;
  createUser: (data: UserInput) => void;
  updateUser: (id: string, data: Partial<UserInput>) => void;
  removeUser: (id: string) => void;
}

const UsersContext = createContext<UsersContextValue | null>(null);

/**
 * Directorio de usuarios de demostración. El backend todavía no tiene autenticación real,
 * así que login y roles viven aquí — pero a diferencia de un mock estático, Administración →
 * Usuarios sí puede crear/editar/deshabilitar cuentas y eso afecta de verdad quién puede entrar.
 */
const SEED_USERS: UserRecord[] = [
  {
    id: "u-admin-1",
    name: "Carla Méndez",
    email: "admin@planta.com",
    password: "admin123",
    role: "ADMINISTRADOR",
    allowedDeviceIps: ["192.168.2.10"],
    habilitado: true,
    ultimoAcceso: null,
    createdAt: new Date().toISOString(),
  },
  {
    id: "u-soporte-1",
    name: "Diego Fernández",
    email: "soporte@planta.com",
    password: "soporte123",
    role: "SOPORTE",
    allowedDeviceIps: ["192.168.2.10"],
    habilitado: true,
    ultimoAcceso: null,
    createdAt: new Date().toISOString(),
  },
  {
    id: "u-consulta-1",
    name: "Elena Rojas",
    email: "consulta@planta.com",
    password: "consulta123",
    role: "CONSULTA",
    allowedDeviceIps: [],
    habilitado: true,
    ultimoAcceso: null,
    createdAt: new Date().toISOString(),
  },
];

function toAuthUser(record: UserRecord): AuthUser {
  return {
    id: record.id,
    name: record.name,
    email: record.email,
    role: record.role,
    allowedDeviceIps: record.allowedDeviceIps,
  };
}

export function UsersProvider({ children }: { children: ReactNode }) {
  const [users, setUsers] = useState<UserRecord[]>(SEED_USERS);

  function authenticate(email: string, password: string): AuthUser | null {
    const match = users.find(
      (user) => user.habilitado && user.email.toLowerCase() === email.trim().toLowerCase() && user.password === password
    );
    if (!match) return null;

    setUsers((prev) =>
      prev.map((user) => (user.id === match.id ? { ...user, ultimoAcceso: new Date().toISOString() } : user))
    );

    return toAuthUser(match);
  }

  const value: UsersContextValue = {
    users,
    authenticate,
    createUser: (data) =>
      setUsers((prev) => [
        ...prev,
        { ...data, id: generateId("user"), ultimoAcceso: null, createdAt: new Date().toISOString() },
      ]),
    updateUser: (id, data) => setUsers((prev) => prev.map((user) => (user.id === id ? { ...user, ...data } : user))),
    removeUser: (id) => setUsers((prev) => prev.filter((user) => user.id !== id)),
  };

  return <UsersContext.Provider value={value}>{children}</UsersContext.Provider>;
}

export function useUsers(): UsersContextValue {
  const context = useContext(UsersContext);
  if (!context) throw new Error("useUsers debe usarse dentro de UsersProvider");
  return context;
}
