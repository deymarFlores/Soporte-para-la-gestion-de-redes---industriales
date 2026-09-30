import { type UserRepository } from "../repositories/user.repository.js";
import { type PasswordHasher } from "../services/passwordHasher.js";
import { type TokenService } from "../services/tokenService.js";
import { UserMapper } from "../../../domain/auth/mappers/user.mapper.js";
import { type AuthResponseDTO } from "../../../domain/auth/dtos/authResponse.dto.js";

export class InvalidCredentialsError extends Error {}

export default class LoginUseCase {
  constructor(
    private readonly userRepository: UserRepository,
    private readonly passwordHasher: PasswordHasher,
    private readonly tokenService: TokenService
  ) {}

  async execute(email: string, password: string): Promise<AuthResponseDTO> {
    const user = await this.userRepository.findByEmail(email.toLowerCase());
    if (!user || !user.enabled) throw new InvalidCredentialsError("Correo o contraseña incorrectos");

    const valid = await this.passwordHasher.compare(password, user.passwordHash);
    if (!valid) throw new InvalidCredentialsError("Correo o contraseña incorrectos");

    user.recordLogin();
    await this.userRepository.update(user);

    const token = this.tokenService.sign({ sub: user.id as string, role: user.role });
    const allowedDeviceIds = await this.userRepository.getAllowedDeviceIds(user.id as string);

    return { token, user: UserMapper.toResponseDTO(user, allowedDeviceIds) };
  }
}
