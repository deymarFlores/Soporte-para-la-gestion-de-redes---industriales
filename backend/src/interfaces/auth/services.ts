import type LoginUseCase from "../../application/auth/useCases/login.useCase.js";
import type CreateUserUseCase from "../../application/auth/useCases/createUser.useCase.js";
import type { CreateUserInput } from "../../application/auth/useCases/createUser.useCase.js";
import type UpdateUserUseCase from "../../application/auth/useCases/updateUser.useCase.js";
import type { UpdateUserInput } from "../../application/auth/useCases/updateUser.useCase.js";
import type DeleteUserUseCase from "../../application/auth/useCases/deleteUser.useCase.js";
import type ListUsersUseCase from "../../application/auth/useCases/listUsers.useCase.js";
import { UserMapper } from "../../domain/auth/mappers/user.mapper.js";
import type { AuthResponseDTO } from "../../domain/auth/dtos/authResponse.dto.js";
import type { UserResponseDTO } from "../../domain/auth/dtos/userResponse.dto.js";
import type { UserRepository } from "../../application/auth/repositories/user.repository.js";

export interface AuthServiceDependencies {
  loginUseCase: LoginUseCase;
  createUserUseCase: CreateUserUseCase;
  updateUserUseCase: UpdateUserUseCase;
  deleteUserUseCase: DeleteUserUseCase;
  listUsersUseCase: ListUsersUseCase;
  userRepository: UserRepository;
}

export class AuthService {
  constructor(private readonly deps: AuthServiceDependencies) {}

  async login(email: string, password: string): Promise<AuthResponseDTO> {
    return this.deps.loginUseCase.execute(email, password);
  }

  async createUser(input: CreateUserInput): Promise<UserResponseDTO> {
    const user = await this.deps.createUserUseCase.execute(input);
    const allowedDeviceIds = await this.deps.userRepository.getAllowedDeviceIds(user.id as string);
    return UserMapper.toResponseDTO(user, allowedDeviceIds);
  }

  async updateUser(id: string, input: UpdateUserInput): Promise<UserResponseDTO> {
    const user = await this.deps.updateUserUseCase.execute(id, input);
    const allowedDeviceIds = await this.deps.userRepository.getAllowedDeviceIds(user.id as string);
    return UserMapper.toResponseDTO(user, allowedDeviceIds);
  }

  async deleteUser(id: string): Promise<void> {
    return this.deps.deleteUserUseCase.execute(id);
  }

  async listUsers(): Promise<UserResponseDTO[]> {
    return this.deps.listUsersUseCase.execute();
  }
}
