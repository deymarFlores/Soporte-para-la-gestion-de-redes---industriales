import { type UserRole } from "../../../domain/auth/valueObjects/userRole.js";

export interface TokenPayload {
  sub: string;
  role: UserRole;
}

export interface TokenService {
  sign(payload: TokenPayload): string;
  verify(token: string): TokenPayload;
}
