import { UnathorizedError } from "../../../../../../errors/unathorized.error";
import { TokenConfig, TokenPayloadConfig, UserActivationConfig } from "../../../../../../config/config";
import { TokensRepository } from "../../../../../../repositories/tokens.repository";
import { AuthenticationClient } from "../authentication-client.types";
import { UsersRepository } from "../../../../../../repositories/users.repostiory";
import { hashValue, hashWithSha512 } from "../../../../../../../../../shared/crypto";
import { verify } from "jsonwebtoken";
import { JwtPayload, TokenType } from "../../../../../../tokens/jwt-payload";
import { NotFoundError } from "../../../../../../errors/not-found.error";
import { ForbiddenError } from "../../../../../../errors/forbidden.error";
import { PolicyRepository } from "../../../../../../repositories/policy.repository";
import { JwtUtils } from "../../../../../../tokens/jwt-utils";
import { BadRequestError } from "../../../../../../errors/bad-request.error";

type CustomAuthenticationClientProps = {
  accessTokenConfig: TokenConfig;
  refreshTokenConfig: TokenConfig;
  tokenPayloadConfig: TokenPayloadConfig;
  userActivationConfig: UserActivationConfig;
  usersRepository: UsersRepository;
  tokensRepository: TokensRepository;
  policyRepository: PolicyRepository;
  jwtUtils: JwtUtils;
};

export class BuiltInAuthenticationClient implements AuthenticationClient {
  constructor(private dependencies: CustomAuthenticationClientProps) {}

  public async login(username: string, password: string) {
    const { usersRepository, userActivationConfig, policyRepository, jwtUtils, tokenPayloadConfig } = this.dependencies;
    const user = await usersRepository.findByUsername(username);

    if (!user || user.password !== hashWithSha512(password, user.passwordSalt)) {
      throw new UnathorizedError("Wrong username or password");
    }

    if (userActivationConfig.isUserActivationNeeded && !user.isActive) {
      throw new ForbiddenError("Account is inactive");
    }

    const attributes = user.attributes.map(({ name }) => name);
    const policy = await policyRepository.getNamesByAttributes(attributes);

    const data = {
      userId: user.id,
      username: user.username,
      attributes: tokenPayloadConfig.disableAttributes ? undefined : attributes,
      policy: tokenPayloadConfig.disablePolicy ? undefined : policy,
      type: TokenType.USER,
    };

    const { accessToken, refreshToken, hashedRefreshToken } = await jwtUtils.generateTokensAndHashedRefreshToken(
      data as JwtPayload,
    );

    await jwtUtils.saveRefreshToken(data.userId as string, hashedRefreshToken);

    return {
      accessToken,
      refreshToken,
    };
  }

  public async loginWithoutPassword(username: string) {
    const { usersRepository, userActivationConfig, policyRepository, jwtUtils, tokenPayloadConfig } = this.dependencies;
    const user = await usersRepository.findByUsername(username);

    if (!user) {
      throw new NotFoundError(`User with username ${username} doesnt exist`);
    }

    if (userActivationConfig.isUserActivationNeeded && !user.isActive) {
      throw new ForbiddenError(`User with username ${username} is inactive`);
    }

    const attributes = user.attributes.map(({ name }) => name);
    const policy = await policyRepository.getNamesByAttributes(attributes);

    const data = {
      userId: user.id,
      username: user.username,
      attributes: tokenPayloadConfig.disableAttributes ? undefined : attributes,
      policy: tokenPayloadConfig.disablePolicy ? undefined : policy,
      type: TokenType.USER,
    };

    const { accessToken, refreshToken, hashedRefreshToken } = await jwtUtils.generateTokensAndHashedRefreshToken(
      data as JwtPayload,
    );

    await jwtUtils.saveRefreshToken(data.userId as string, hashedRefreshToken);

    return {
      accessToken,
      refreshToken,
    };
  }

  public async isAuthenticated(accessToken: string): Promise<boolean> {
    const { accessTokenConfig, jwtUtils } = this.dependencies;
    return jwtUtils.verifyToken(accessToken, accessTokenConfig);
  }

  public async refreshToken(
    accessToken: string,
    refreshToken: string,
  ): Promise<{ accessToken: string; refreshToken: string }> {
    const payload = verify(accessToken, this.dependencies.accessTokenConfig.secret, {
      ignoreExpiration: true,
    }) as JwtPayload;
    const { refreshTokenConfig, jwtUtils, tokenPayloadConfig } = this.dependencies;

    const refreshTokenBelongsToUser = await this.dependencies.tokensRepository.belongsToUser(
      payload.userId,
      hashWithSha512(refreshToken, refreshTokenConfig.secret),
    );

    if (!refreshTokenBelongsToUser) {
      throw new UnathorizedError("Failed to refresh a token");
    }

    await jwtUtils.verifyToken(refreshToken, refreshTokenConfig);

    const data = {
      userId: payload.userId,
      username: payload.username,
      attributes: tokenPayloadConfig.disableAttributes ? undefined : payload.attributes,
      policy: tokenPayloadConfig.disablePolicy ? undefined : payload.policy,
      type: TokenType.USER,
    };

    const {
      accessToken: generatedAccessToken,
      refreshToken: generatedRefreshToken,
      hashedRefreshToken,
    } = await jwtUtils.generateTokensAndHashedRefreshToken(data);

    await jwtUtils.saveRefreshToken(data.userId, hashedRefreshToken);

    return {
      accessToken: generatedAccessToken,
      refreshToken: generatedRefreshToken,
    };
  }

  public async resetPassword(userName: string, newPassword: string) {
    const { usersRepository } = this.dependencies;

    const user = await usersRepository.findByUsername(userName);

    if (!user) {
      throw new NotFoundError(`User ${userName} doesn't exist.`);
    }
    const hashedPasswordAndSalt = hashValue(newPassword, hashWithSha512);

    user.password = hashedPasswordAndSalt.hash;
    user.passwordSalt = hashedPasswordAndSalt.salt;
    user.resetPasswordToken = null;

    await usersRepository.save(user);
  }

  public async setNewPassword(userName: string, oldPassword: string, newPassword: string) {
    const { usersRepository } = this.dependencies;

    const user = await usersRepository.findByUsername(userName);

    if (!user) {
      throw new NotFoundError(`User ${userName} doesn't exist.`);
    }

    const oldHashedPassword = hashWithSha512(oldPassword, user.passwordSalt);

    if (user.password !== oldHashedPassword) {
      throw new BadRequestError("Can't set new password");
    }

    const newHashedPasswordAndSalt = hashValue(newPassword, hashWithSha512);

    user.password = newHashedPasswordAndSalt.hash;
    user.passwordSalt = newHashedPasswordAndSalt.salt;

    await usersRepository.save(user);
  }

  private async removeAllRefreshTokens(userId: string) {
    await this.dependencies.tokensRepository.removeAllRefreshTokens(userId);
  }
}
