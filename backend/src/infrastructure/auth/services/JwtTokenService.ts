import jwt, { type SignOptions } from "jsonwebtoken";
import { type TokenPayload, type TokenService } from "../../../application/auth/services/tokenService.js";

export default class JwtTokenService implements TokenService {
  constructor(
    private readonly secret: string,
    private readonly expiresIn: string
  ) {}

  sign(payload: TokenPayload): string {
    const options: SignOptions = { expiresIn: this.expiresIn as SignOptions["expiresIn"] };
    return jwt.sign(payload, this.secret, options);
  }

  verify(token: string): TokenPayload {
    return jwt.verify(token, this.secret) as unknown as TokenPayload;
  }
}
