import { type UserRepository } from "../repositories/user.repository.js";
import { UserNotFoundError } from "./updateUser.useCase.js";

export { UserNotFoundError };
export class UserInUseError extends Error {}

export default class DeleteUserUseCase {
  constructor(private readonly userRepository: UserRepository) {}

  async execute(id: string): Promise<void> {
    const existing = await this.userRepository.findById(id);
    if (!existing) throw new UserNotFoundError(`Usuario ${id} no encontrado`);

    await this.userRepository.delete(id);
  }
}
