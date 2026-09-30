import bcrypt from "bcrypt";
import { type PasswordHasher } from "../../../application/auth/services/passwordHasher.js";

const SALT_ROUNDS = 10;

export default class BcryptPasswordHasher implements PasswordHasher {
  async hash(plain: string): Promise<string> {
    return bcrypt.hash(plain, SALT_ROUNDS);
  }

  async compare(plain: string, hash: string): Promise<boolean> {
    return bcrypt.compare(plain, hash);
  }
}
