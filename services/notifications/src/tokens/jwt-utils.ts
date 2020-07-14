import { verify } from "jsonwebtoken";
import { JwtPayload } from "./jwt-payload";
import { UnathorizedError } from "../errors/unathorized.error";
import { TokenConfig } from "../config/config";
import { Logger } from "winston";

export interface JwtUtilsProps {
  accessTokenConfig: TokenConfig;
  logger: Logger;
}

export class JwtUtils {
  constructor(private dependencies: JwtUtilsProps) {}

  public tryToGetPayloadFromTokenOrThrow(token: string) {
    try {
      return verify(token, this.dependencies.accessTokenConfig.secret) as JwtPayload;
    } catch (e) {
      const errorMessage = "Failed to verify a token.";
      this.dependencies.logger.error(errorMessage, e);
      throw new UnathorizedError(errorMessage);
    }
  }
}
