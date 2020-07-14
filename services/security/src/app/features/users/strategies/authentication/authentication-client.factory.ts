import { AppConfig } from "../../../../../config/config";
import { BuiltInAuthenticationClient } from "./built-in/built-in-authentication-client";
import { KeycloakAuthenticationClient } from "./keycloak/keycloak-authentication-client";
import { AuthenticationStrategy } from "../../../../../config/config";

export const getAuthenticationClient = async (type: AuthenticationStrategy, config: AppConfig) => {
  switch (type) {
    case AuthenticationStrategy.Builtin:
      return BuiltInAuthenticationClient;
    case AuthenticationStrategy.Keycloak:
      return KeycloakAuthenticationClient;
    case AuthenticationStrategy.Proxy:
      if (!config.adapterPath) {
        throw new Error("config.adapterPath must be set when using Proxy authentication strategy.");
      }
      return import(config.adapterPath);
    default:
      throw new Error(`Can't create auth strategy for type "${type}"`);
  }
};
