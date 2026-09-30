import prisma from "../../infrastructure/database/prismaClient.js";
import { AuthService } from "./services.js";
import { AuthController } from "./controller.js";
import PrismaUserRepository from "../../infrastructure/auth/repositories/UserRepository.Impl.js";
import BcryptPasswordHasher from "../../infrastructure/auth/services/BcryptPasswordHasher.js";
import JwtTokenService from "../../infrastructure/auth/services/JwtTokenService.js";
import LoginUseCase from "../../application/auth/useCases/login.useCase.js";
import CreateUserUseCase from "../../application/auth/useCases/createUser.useCase.js";
import UpdateUserUseCase from "../../application/auth/useCases/updateUser.useCase.js";
import DeleteUserUseCase from "../../application/auth/useCases/deleteUser.useCase.js";
import ListUsersUseCase from "../../application/auth/useCases/listUsers.useCase.js";
import { env } from "../../config/env.js";

export class AuthDependencies {
  static createController(): AuthController {
    const userRepository = new PrismaUserRepository(prisma);
    const passwordHasher = new BcryptPasswordHasher();
    const tokenService = new JwtTokenService(env.jwtSecret, env.jwtExpiresIn);

    const authService = new AuthService({
      loginUseCase: new LoginUseCase(userRepository, passwordHasher, tokenService),
      createUserUseCase: new CreateUserUseCase(userRepository, passwordHasher),
      updateUserUseCase: new UpdateUserUseCase(userRepository, passwordHasher),
      deleteUserUseCase: new DeleteUserUseCase(userRepository),
      listUsersUseCase: new ListUsersUseCase(userRepository),
      userRepository,
    });

    return new AuthController(authService);
  }
}
