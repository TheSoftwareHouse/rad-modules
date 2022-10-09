import { sign, verify } from "jsonwebtoken";
import { JwtPayload } from "./jwt-payload";
import { UnathorizedError } from "../errors/unathorized.error";
import { TokenConfig } from "../config/config";
import { Logger } from "@tshio/logger";
import { hashWithSha512 } from "../../../../shared/crypto";
import { TokensRepository } from "../repositories/tokens.repository";

export interface JwtUtilsProps {
  tokensRepository: TokensRepository;
  accessTokenConfig: TokenConfig;
  refreshTokenConfig: TokenConfig;
  logger: Logger;
}

export class JwtUtils {
  constructor(private dependencies: JwtUtilsProps) {}

  public tryToGetPayloadFromTokenOrThrow(accessToken: string): JwtPayload {
    const { accessTokenConfig, logger } = this.dependencies;
    try {
      return verify(accessToken, accessTokenConfig.secret) as JwtPayload;
    } catch (e) {
      const errorMessage = "Failed to verify a token.";
      logger.error(errorMessage, e);
      throw new UnathorizedError(errorMessage);
    }
  }

  // @ts-ignore
  public async generateToken(data: JwtPayload, tokenConfig: TokenConfig): Promise<string> {
    return new Promise((resolve, reject) => {

      sign(
        { ...data },
        tokenConfig.secret,
        { expiresIn: tokenConfig.expirationInSeconds },
          // @ts-ignore
        (err: Error, token: string) => {
          if (err) {
            return reject(new Error("Failed to sign a token"));
          }

          return resolve(token);
        },
      );
    });
  }

  public async verifyToken(token: string, config: TokenConfig): Promise<boolean> {
    return new Promise((resolve, reject) => {
      verify(token, config.secret, (error) => {
        if (error) {
          return reject(new UnathorizedError("Failed to verify token"));
        }

        return resolve(true);
      });
    });
  }

  public async saveRefreshToken(userId: string, hashedRefreshToken: string) {
    await this.dependencies.tokensRepository.addRefreshToken(userId, hashedRefreshToken);
  }

  public async hashRefreshToken(refreshToken: string) {
    const { refreshTokenConfig } = this.dependencies;
    const { secret } = refreshTokenConfig;
    return hashWithSha512(refreshToken, secret);
  }

  public async generateTokensAndHashedRefreshToken(data: JwtPayload) {
    const { accessTokenConfig, refreshTokenConfig } = this.dependencies;
    const accessTokenConf = { ...accessTokenConfig };
    const refreshTokenConf = { ...refreshTokenConfig };

    accessTokenConf.expirationInSeconds = data.accessExpirationInSeconds || accessTokenConfig.expirationInSeconds;
    refreshTokenConf.expirationInSeconds = data.refreshExpirationInSeconds || refreshTokenConfig.expirationInSeconds;

    const accessToken = await this.generateToken(data, accessTokenConf);

    const refreshToken = await this.generateToken(data, refreshTokenConf);

    const hashedRefreshToken = hashWithSha512(refreshToken, refreshTokenConf.secret);

    return {
      accessToken,
      refreshToken,
      hashedRefreshToken,
    };
  }

  public async getPayloadFromTokenWithoutSecret(bearerToken: string) {
    const tokenPayloadBase64 = bearerToken.split(".")[1];

    const tokenPayloadJson = Buffer.from(tokenPayloadBase64, "base64").toString();

    return JSON.parse(tokenPayloadJson);
  }
}
