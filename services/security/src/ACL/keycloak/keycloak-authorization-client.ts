import { AuthorizationClient, AuthorizationClientProps, HasAccessResponse } from "../authorization-client.types";
import { NotFoundError } from "../../errors/not-found.error";

export class KeycloakAuthorizationClient implements AuthorizationClient {
  constructor(private dependencies: AuthorizationClientProps) {}

  public async isSuperAdmin(accessToken: string): Promise<boolean> {
    const { superAdminRoleName } = this.dependencies;
    return this.hasAttributes(accessToken, [superAdminRoleName]);
  }

  public async hasAccess(accessToken: string, resources: string[]): Promise<HasAccessResponse> {
    const { keycloakManager } = this.dependencies;

    const checkPermissionsPromise = resources.map((resource) => keycloakManager.checkPermission(accessToken, resource));

    const permissions = await Promise.all(checkPermissionsPromise);

    return {
      hasAccess: !permissions.some((permission) => permission === false),
    };
  }

  public async hasAttributes(accessToken: string, attributes: string[]): Promise<boolean> {
    const { jwtUtils, usersRepository, keycloakManager } = this.dependencies;

    await keycloakManager.verifyToken(accessToken);

    const { preferred_username: username } = await jwtUtils.getPayloadFromTokenWithoutSecret(accessToken);
    const user = await usersRepository.findByUsername(username);

    if (!user) {
      throw new NotFoundError(`User with id ${username} doesn't exist.`);
    }

    const userAttributesNames = user.attributes.map((attribute) => attribute.name);

    return attributes.every((attribute) => userAttributesNames.includes(attribute));
  }
}
