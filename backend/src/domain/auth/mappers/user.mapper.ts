import { type UserEntity } from "../entities/user.entity.js";
import { type UserResponseDTO } from "../dtos/userResponse.dto.js";

export class UserMapper {
  static toResponseDTO(entity: UserEntity, allowedDeviceIds: string[] = []): UserResponseDTO {
    return {
      id: entity.id as string,
      name: entity.name,
      email: entity.email,
      role: entity.role,
      enabled: entity.enabled,
      lastLoginAt: entity.lastLoginAt ? entity.lastLoginAt.toISOString() : null,
      allowedDeviceIds,
    };
  }
}
