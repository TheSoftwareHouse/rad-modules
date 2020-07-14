import { NotFoundError } from "../../errors/not-found.error";
import { TokenType } from "../../tokens/jwt-payload";
import { UnathorizedError } from "../../errors/unathorized.error";
import { AuthorizationClient, AuthorizationClientProps } from "../authorization-client.types";
import { UserModelGeneric } from "../../app/features/users/models/user.model";

export class BuiltinAuthorizationClient implements AuthorizationClient {
  constructor(private dependencies: AuthorizationClientProps) {}

  public async isSuperAdmin(accessToken: string): Promise<boolean> {
    const { superAdminRoleName } = this.dependencies;
    return this.hasAttributes(accessToken, [superAdminRoleName]);
  }

  public async hasAccess(accessToken: string, resource: string): Promise<boolean> {
    const { jwtUtils, usersRepository } = this.dependencies;

    const { userId, type, attributes } = jwtUtils.tryToGetPayloadFromTokenOrThrow(accessToken);
    switch (type) {
      case TokenType.USER: {
        const user = await usersRepository.findById(userId);

        return user ? this.hasAccessUser(resource, user) : false;
      }

      case TokenType.CUSTOM:
        return this.hasAccessCustom(attributes || [], resource);

      default:
        throw new UnathorizedError("Invalid token type");
    }
  }

  private async hasAccessCustom(attributes: string[], resource: string): Promise<boolean> {
    const { policyRepository } = this.dependencies;

    const resourcePolicy = await policyRepository.findBy({ resource });
    const resourceAttributes = resourcePolicy.map((policy) => policy.attribute);

    return attributes.some((attribute) => resourceAttributes.includes(attribute));
  }

  private async hasAccessUser(resource: string, user: UserModelGeneric): Promise<boolean> {
    const { policyRepository, superAdminRoleName } = this.dependencies;

    const isSuperAdmin = user.attributes.some(({ name }) => name === superAdminRoleName);

    if (isSuperAdmin) {
      return true;
    }

    const resourcePolicies = await policyRepository.findBy({ resource });

    if (resourcePolicies.length === 0) {
      return false;
    }

    const neededAttributes = resourcePolicies.map((policy) => policy.attribute);
    const userAttributeNames = user.attributes.map((attribute) => attribute.name);
    const hasAllNeededAttributes =
      neededAttributes.filter((attribute) => !userAttributeNames.includes(attribute)).length < neededAttributes.length;

    return hasAllNeededAttributes;
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
}
