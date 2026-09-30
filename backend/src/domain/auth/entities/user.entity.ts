import { USER_ROLE, type UserRole } from "../valueObjects/userRole.js";

export interface UserEntityProps {
  id?: string;
  name: string;
  email: string;
  passwordHash: string;
  role: UserRole;
  enabled?: boolean;
  lastLoginAt?: Date | null;
  createdAt?: Date;
  updatedAt?: Date;
}

export class UserEntity {
  id: string | undefined;
  name: string;
  email: string;
  passwordHash: string;
  role: UserRole;
  enabled: boolean;
  lastLoginAt: Date | null;
  createdAt: Date;
  updatedAt: Date;

  constructor(props: UserEntityProps) {
    if (!props.name) throw new Error("El usuario debe tener un nombre");
    if (!props.email) throw new Error("El usuario debe tener un correo");
    if (!Object.values(USER_ROLE).includes(props.role)) throw new Error(`Rol inválido: ${props.role}`);

    this.id = props.id;
    this.name = props.name;
    this.email = props.email.toLowerCase();
    this.passwordHash = props.passwordHash;
    this.role = props.role;
    this.enabled = props.enabled ?? true;
    this.lastLoginAt = props.lastLoginAt ?? null;
    this.createdAt = props.createdAt ?? new Date();
    this.updatedAt = props.updatedAt ?? new Date();
  }

  recordLogin(at: Date = new Date()): void {
    this.lastLoginAt = at;
    this.updatedAt = at;
  }
}
