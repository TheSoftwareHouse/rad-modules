import { NotFoundError } from "../../errors/not-found.error";
import { TokenType } from "../../tokens/jwt-payload";
import { UnathorizedError } from "../../errors/unathorized.error";
import { AuthorizationClient, AuthorizationClientProps, HasAccessResponse } from "../authorization-client.types";
import { UserModelGeneric } from "../../app/features/users/models/user.model";
import * as jwt from "jsonwebtoken";
import { AttributeModelGeneric } from "../../app/features/users/models/attribute.model";
import { HttpError } from "../../errors/http.error";
import { StatusCodes } from "http-status-codes";

export class BuiltinAuthorizationClient implements AuthorizationClient {
  constructor(private dependencies: AuthorizationClientProps) {}

  public async isSuperAdmin(accessToken: string): Promise<boolean> {
    const { superAdminRoleName } = this.dependencies;
    return this.hasAttributes(accessToken, [superAdminRoleName]);
  }

  public async hasAccess(accessToken: string, resources: string[]): Promise<HasAccessResponse> {
    const { jwtUtils, usersRepository } = this.dependencies;

    const { userId, type, attributes } = jwtUtils.tryToGetPayloadFromTokenOrThrow(accessToken);
    switch (type) {
      case TokenType.USER: {
        const user = await usersRepository.findById(userId);
        if (!user) {
          return {
            hasAccess: false,
          };
        }
        return this.hasAccessUser(resources, user);
      }

      case TokenType.CUSTOM:
        return this.hasAccessCustom(attributes || [], resources);

      default:
        throw new UnathorizedError("Invalid token type");
    }
  }

  private async hasAccessCustom(attributes: string[], resources: string[]): Promise<HasAccessResponse> {
    const { policyRepository } = this.dependencies;

    const policies = await policyRepository.findByResourcesAndAttributes(resources, attributes);

    return {
      hasAccess: policies.length === attributes.length,
    };
  }

  private async hasAccessUser(resources: string[], user: UserModelGeneric): Promise<HasAccessResponse> {
    const { policyRepository, superAdminRoleName } = this.dependencies;

    const isSuperAdmin = user.attributes.some(({ name }) => name === superAdminRoleName);

    if (isSuperAdmin) {
      return {
        hasAccess: true,
      };
    }

    const policies = await policyRepository.findByResourcesAndAttributes(
      resources,
      user.attributes.map((attribute) => attribute.name),
    );

    return {
      hasAccess: policies.length === resources.length && policies.length !== 0,
    };
  }

  public async hasAttributes(accessToken: string, attributes: string[]): Promise<boolean> {
    const { jwtUtils, usersRepository } = this.dependencies;
    const { userId } = jwtUtils.tryToGetPayloadFromTokenOrThrow(accessToken);
    const user = await usersRepository.findById(userId);

    if (!user) {
      throw new NotFoundError(`User with id ${userId} doesn't exist.`);
    }

    const userAttributesNames = user.attributes.map((attribute) => attribute.name);

    return attributes.every((attribute) => userAttributesNames.includes(attribute));
  }

  public async getTokenInfo(accessToken: string): Promise<any> {
    const { usersRepository, policyRepository } = this.dependencies;

    const { userId } = jwt.decode(accessToken) as any;

    const { id, username, isActive, attributes } = await usersRepository.findById(userId).then((user) => {
      if (user === undefined) {
        throw new HttpError("User not exist!", StatusCodes.INTERNAL_SERVER_ERROR);
      }
      return user;
    });

    const attributesName = (attributes ?? []).map((attribute: AttributeModelGeneric) => attribute.name);
    const resources = await policyRepository.getNamesByAttributes(attributesName);

    return {
      id,
      username,
      email: username,
      isActive,
      attributes: attributesName,
      resources,
    };
  }
}
