import { AuthenticationClient } from "../authentication-client.types";
import { ForbiddenError } from "../../../../../../errors/forbidden.error";
import { KeycloakManagerConfig, TokenConfig, UserActivationConfig } from "../../../../../../config/config";
import { JwtUtils } from "../../../../../../tokens/jwt-utils";
import { KeycloakManager } from "../../../../../../utils/keycloak/keycloak-manager";
import { NotFoundError } from "../../../../../../errors/not-found.error";
import { JwtPayload, TokenType } from "../../../../../../tokens/jwt-payload";
import { UsersRepository } from "../../../../../../repositories/users.repostiory";
import { PolicyRepository } from "../../../../../../repositories/policy.repository";
import { HttpError } from "../../../../../../errors/http.error";
import { INTERNAL_SERVER_ERROR } from "http-status-codes";
import { KeycloakAuthenticationClientConfig } from "../../../../../../config/keycloak.config";

export interface KeycloakClientProperties {
  keycloakAuthenticationClientConfig: KeycloakAuthenticationClientConfig;
  keycloakManagerConfig: KeycloakManagerConfig;
  jwtUtils: JwtUtils;
  accessTokenConfig: TokenConfig;
  keycloakManager: KeycloakManager;
  userActivationConfig: UserActivationConfig;
  usersRepository: UsersRepository;
  policyRepository: PolicyRepository;
}

export class KeycloakAuthenticationClient implements AuthenticationClient {
  constructor(private dependencies: KeycloakClientProperties) {}

  public async login(username: string, password: string) {
    const { keycloakManager, jwtUtils } = this.dependencies;

    const data = await keycloakManager.login(username, password);

    const hashedRefreshToken = await jwtUtils.hashRefreshToken(data.refreshToken);
    await jwtUtils.saveRefreshToken(data.userId as string, hashedRefreshToken);

    return {
      accessToken: data.accessToken,
      refreshToken: data.refreshToken,
    };
  }

  public async refreshToken(refreshToken: string) {
    const { keycloakManager, jwtUtils } = this.dependencies;

    const data = await keycloakManager.refreshToken(refreshToken);

    const hashedRefreshToken = await jwtUtils.hashRefreshToken(data.refreshToken);
    await jwtUtils.saveRefreshToken(data.userId as string, hashedRefreshToken);

    return {
      accessToken: data.accessToken,
      refreshToken: data.refreshToken,
    };
  }

  public async loginWithoutPassword(username: string) {
    const { usersRepository, userActivationConfig, policyRepository, jwtUtils } = this.dependencies;
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
      attributes,
      policy,
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
    const { keycloakManager } = this.dependencies;
    return keycloakManager
      .checkToken(accessToken)
      .then(() => true)
      .catch(() => false);
  }

  public async resetPassword(userName: string, newPassword: string) {
    const { keycloakManager } = this.dependencies;
    return keycloakManager.resetPassword(userName, newPassword);
  }

  public async setNewPassword(userName: string, oldPassword: string, newPassword: string) {
    const { keycloakManager } = this.dependencies;
    return keycloakManager.setNewPassword(userName, oldPassword, newPassword);
  }

  public async getUserResources(_username: string) {
    throw new HttpError("Not implemented", INTERNAL_SERVER_ERROR);
  }
}
