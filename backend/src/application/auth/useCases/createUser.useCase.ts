import { type UserRepository } from "../repositories/user.repository.js";
import { type PasswordHasher } from "../services/passwordHasher.js";
import { UserEntity } from "../../../domain/auth/entities/user.entity.js";
import { type UserRole } from "../../../domain/auth/valueObjects/userRole.js";

export interface CreateUserInput {
  name: string;
  email: string;
  password: string;
  role: UserRole;
  enabled?: boolean;
  allowedDeviceIds?: string[];
}

export class EmailAlreadyExistsError extends Error {}

export default class CreateUserUseCase {
  constructor(
    private readonly userRepository: UserRepository,
    private readonly passwordHasher: PasswordHasher
  ) {}

  async execute(input: CreateUserInput): Promise<UserEntity> {
    const existing = await this.userRepository.findByEmail(input.email.toLowerCase());
    if (existing) throw new EmailAlreadyExistsError(`Ya existe un usuario con el correo ${input.email}`);

    const passwordHash = await this.passwordHasher.hash(input.password);
    const user = new UserEntity({
      name: input.name,
      email: input.email,
      passwordHash,
      role: input.role,
      enabled: input.enabled ?? true,
    });

    const created = await this.userRepository.create(user);
    if (input.allowedDeviceIds) {
      await this.userRepository.setAllowedDeviceIds(created.id as string, input.allowedDeviceIds);
    }
    return created;
  }
}
