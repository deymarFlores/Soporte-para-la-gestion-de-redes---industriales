import { type UserResponseDTO } from "./userResponse.dto.js";

export interface AuthResponseDTO {
  token: string;
  user: UserResponseDTO;
}
