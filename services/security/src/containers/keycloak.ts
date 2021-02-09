import { AwilixContainer } from "awilix";
import * as awilix from "awilix";
import { KeycloakManager } from "../utils/keycloak/keycloak-manager";
import { KeycloakClient } from "../app/features/users/oauth/keycloak/keycloak-client";
import { AppConfig } from "../config/config";

export async function registerKeycloak(container: AwilixContainer, appConfig: AppConfig) {
  container.register({
    keycloakManager: awilix.asClass(KeycloakManager).singleton(),
    keycloakClientConfig: awilix.asValue(appConfig.keycloakClientConfig),
    keycloakClient: awilix.asClass(KeycloakClient),
  });

  return container;
}
