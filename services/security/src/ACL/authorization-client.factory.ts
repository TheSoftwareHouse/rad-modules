import { AuthenticationStrategy } from "../config/config";
import { BuiltinAuthorizationClient } from "./built-in/builtin-authorization-client";
import { KeycloakAuthorizationClient } from "./keycloak/keycloak-authorization-client";

// TODO: how to change Promise<any> to Promise<AuthorizationClient>?
export const getAuthorizationClient = async (type: AuthenticationStrategy): Promise<any> => {
  switch (type) {
    case AuthenticationStrategy.Builtin:
    case AuthenticationStrategy.Proxy:
      return BuiltinAuthorizationClient;
    case AuthenticationStrategy.Keycloak:
      return KeycloakAuthorizationClient;
    default:
      throw new Error(`Can't create auth client for type "${type}"`);
  }
};
