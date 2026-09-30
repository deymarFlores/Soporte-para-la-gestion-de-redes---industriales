import { type UserRepository } from "../repositories/user.repository.js";
import { UserMapper } from "../../../domain/auth/mappers/user.mapper.js";
import { type UserResponseDTO } from "../../../domain/auth/dtos/userResponse.dto.js";

export default class ListUsersUseCase {
  constructor(private readonly userRepository: UserRepository) {}

  async execute(): Promise<UserResponseDTO[]> {
    const users = await this.userRepository.findAll();
    const withAccess = await Promise.all(
      users.map(async (user) => ({
        user,
        allowedDeviceIds: await this.userRepository.getAllowedDeviceIds(user.id as string),
      }))
    );
    return withAccess.map(({ user, allowedDeviceIds }) => UserMapper.toResponseDTO(user, allowedDeviceIds));
  }
}
