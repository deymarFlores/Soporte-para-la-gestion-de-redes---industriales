import { type UserEntity } from "../../../domain/auth/entities/user.entity.js";

export interface UserRepository {
  create(user: UserEntity): Promise<UserEntity>;
  update(user: UserEntity): Promise<UserEntity>;
  delete(id: string): Promise<void>;
  findById(id: string): Promise<UserEntity | null>;
  findByEmail(email: string): Promise<UserEntity | null>;
  findAll(): Promise<UserEntity[]>;

  getAllowedDeviceIds(userId: string): Promise<string[]>;
  setAllowedDeviceIds(userId: string, nodeIds: string[]): Promise<void>;
}
