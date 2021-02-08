import { AwilixContainer } from "awilix";
import * as awilix from "awilix";
import { AppConfig, AuthenticationStrategy } from "../config/config";
import { createConnection, EntityManager, getCustomRepository } from "typeorm";
import { AttributesTypeormRepository } from "../repositories/typeorm/attributes.typeorm.repository";
import { AccessKeyTypeormRepository } from "../repositories/typeorm/access-key.typeorm.repository";
import { UsersTypeormRepository } from "../repositories/typeorm/users.typeorm.repository";
import { PolicyTypeormRepository } from "../repositories/typeorm/policy.typeorm.repository";
import { UsersKeycloakRepository } from "../repositories/keycloak/users.keycloak.repository";
import { PolicyKeycloakRepository } from "../repositories/keycloak/policy.keycloak.repository";
import { InitialUsers, InitialUsersProperties } from "../init/initial-users";
import { InitialPolicy } from "../init/initial-policies";
import { InitialApiKeys } from "../init/initial-api-keys";
import { ActivationTokenUtils } from "../tokens/activation-token-utils";
import * as RandExp from "randexp";

function getRepositories(strategy: AuthenticationStrategy) {
  switch (strategy) {
    case AuthenticationStrategy.Builtin: {
      const usersRepository = awilix.asValue(getCustomRepository(UsersTypeormRepository));
      const policyRepository = awilix.asValue(getCustomRepository(PolicyTypeormRepository));
      return { usersRepository, policyRepository };
    }
    case AuthenticationStrategy.Keycloak: {
      const usersRepository = awilix.asClass(UsersKeycloakRepository).singleton();
      const policyRepository = awilix.asClass(PolicyKeycloakRepository).singleton();
      return { usersRepository, policyRepository };
    }
    default:
      throw new Error(`Strategy '${strategy}' not supported`);
  }
}

export async function registerDatabase(container: AwilixContainer, appConfig: AppConfig) {
  const dbConnection = await createConnection(appConfig.dbConfig);
  await dbConnection.runMigrations();

  const userPasswordIsRandom = appConfig.userPassword.isRandom;
  const passwordGenerator = new RandExp(appConfig.passwordRegex);
  passwordGenerator.max = appConfig.resetPassword.randomMaxLength;

  const activationTokenUtils = new ActivationTokenUtils({ userActivationConfig: appConfig.userActivationConfig });

  const initialUsersProperties: InitialUsersProperties = {
    entityManager: new EntityManager(dbConnection),
    usersRepository: getCustomRepository(UsersTypeormRepository),
    passwordGenerator,
    userPasswordIsRandom,
    activationTokenUtils,
  };

  const initialUsersFromFile = await import(appConfig.initialUsersDataJsonPath);
  const initialUsersData = [{ ...appConfig.superAdminUser, isActive: true }, ...initialUsersFromFile];

  const initialPoliciesDataFromFile = await import(appConfig.initialPoliciesDataJsonPath);
  const initialPoliciesDataFromConfig = Object.values(appConfig.adminPanelPolicies);
  const initialPoliciesData = [...initialPoliciesDataFromFile, ...initialPoliciesDataFromConfig];

  const initialUsers = new InitialUsers(initialUsersProperties);
  await initialUsers.update(initialUsersData);

  const initialPolicy = new InitialPolicy();
  await initialPolicy.update(initialPoliciesData);

  const initialApiKeys = new InitialApiKeys();
  await initialApiKeys.update(appConfig.initialApiKeys);

  const { usersRepository, policyRepository } = getRepositories(appConfig.authenticationStrategy);

  container.register({
    dbConnection: awilix.asValue(dbConnection),
    usersRepository,
    attributesRepository: awilix.asValue(getCustomRepository(AttributesTypeormRepository)),
    policyRepository,
    accessKeyRepository: awilix.asValue(getCustomRepository(AccessKeyTypeormRepository)),
  });

  return container;
}
