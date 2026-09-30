import { apiGet, apiPost, apiPut, apiDelete } from "./client.js";
import type { AuthUser, Role } from "../types/auth.js";

export interface LoginResponse {
  token: string;
  user: AuthUser;
}

export function login(email: string, password: string): Promise<LoginResponse> {
  return apiPost<LoginResponse>("/api/auth/login", { email, password });
}

export interface UserInput {
  name: string;
  email: string;
  password: string;
  role: Role;
  allowedDeviceIds: string[];
  enabled: boolean;
}

export function listUsers(): Promise<AuthUser[]> {
  return apiGet<AuthUser[]>("/api/usuarios");
}

export function createUser(input: UserInput): Promise<AuthUser> {
  return apiPost<AuthUser>("/api/usuarios", input);
}

export function updateUser(id: string, input: Partial<UserInput>): Promise<AuthUser> {
  return apiPut<AuthUser>(`/api/usuarios/${id}`, input);
}

export function deleteUser(id: string): Promise<null> {
  return apiDelete<null>(`/api/usuarios/${id}`);
}
