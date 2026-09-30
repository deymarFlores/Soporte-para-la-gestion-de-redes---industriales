import { type UserRepository } from "../repositories/user.repository.js";
import { type PasswordHasher } from "../services/passwordHasher.js";
import { UserEntity } from "../../../domain/auth/entities/user.entity.js";
import { type UserRole } from "../../../domain/auth/valueObjects/userRole.js";

export interface UpdateUserInput {
  name?: string;
  email?: string;
  password?: string;
  role?: UserRole;
  enabled?: boolean;
  allowedDeviceIds?: string[];
}

export class UserNotFoundError extends Error {}

export default class UpdateUserUseCase {
  constructor(
    private readonly userRepository: UserRepository,
    private readonly passwordHasher: PasswordHasher
  ) {}

  async execute(id: string, input: UpdateUserInput): Promise<UserEntity> {
    const existing = await this.userRepository.findById(id);
    if (!existing) throw new UserNotFoundError(`Usuario ${id} no encontrado`);

    const passwordHash = input.password ? await this.passwordHasher.hash(input.password) : existing.passwordHash;

    const updated = new UserEntity({
      id: existing.id,
      name: input.name ?? existing.name,
      email: input.email ?? existing.email,
      passwordHash,
      role: input.role ?? existing.role,
      enabled: input.enabled ?? existing.enabled,
      lastLoginAt: existing.lastLoginAt,
      createdAt: existing.createdAt,
      updatedAt: new Date(),
    });

    const saved = await this.userRepository.update(updated);
    if (input.allowedDeviceIds) {
      await this.userRepository.setAllowedDeviceIds(saved.id as string, input.allowedDeviceIds);
    }
    return saved;
  }
}
