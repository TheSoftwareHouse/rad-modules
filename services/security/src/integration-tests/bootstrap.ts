import "mocha";
import { AwilixContainer } from "awilix";
import { createConnection, Connection } from "typeorm";
import { appConfig, SuperAdminConfig } from "../config/config";
import { createContainer } from "../container";
import { InitialUsersProperties, InitialUsers, InitialUserData } from "../init/initial-users";
import { EntityManager } from "typeorm";
import * as RandExp from "randexp";
import { UsersTypeormRepository } from "../repositories/typeorm/users.typeorm.repository";
import { ActivationTokenUtils } from "../tokens/activation-token-utils";
import { InitialPolicy, InitialPolicyData } from "../init/initial-policies";
import { usersFixture } from "./fixtures/users.fixture";
import { policiesFixture } from "./fixtures/policies.fixture";
import { AuthenticationClient } from "../app/features/users/strategies/authentication/authentication-client.types";
import { PolicyRepository } from "../repositories/policy.repository";
import { Application } from "../app/application.types";

export interface BootstrapData {
  app: Application;
  dbConnection: Connection;
  container: AwilixContainer;
  superAdminUser: SuperAdminConfig;
  usersRepository: UsersTypeormRepository;
  policyRepository: PolicyRepository;
  authClient: AuthenticationClient;
  initialUsersProperties: InitialUsersProperties;
}

export type GetBootstrap = () => BootstrapData;

export interface GlobalData extends NodeJS.Global {
  getBootstrap: GetBootstrap;
  bootstrap: BootstrapData;
}

type entity = {
  name: string;
  tableName: string;
};

declare const global: GlobalData;

function getEntities(connection: Connection): entity[] {
  const entities = connection.entityMetadatas.map(({ name, tableName }) => ({ name, tableName }));
  return entities;
}

async function cleanAll(connection: Connection, entities: entity[]) {
  try {
    const actionsToCleanRepositories = entities.map((entity) => {
      const repository = connection.getRepository(entity.name);
      return repository.query(`TRUNCATE TABLE "${entity.tableName}" CASCADE;`);
    });

    return Promise.all(actionsToCleanRepositories);
  } catch (error) {
    throw new Error(`ERROR: Cleaning test db: ${error}`);
  }
}

export const clearDb = async (connection: Connection) => {
  const entities = getEntities(connection);
  return cleanAll(connection, entities);
};

before("Create test DB and create container and dependencies", async function () {
  const dbConnection = await createConnection({
    name: "integration-tests-connection",
    ...appConfig.dbConfig,
    logging: false,
  });

  await dbConnection.dropDatabase();
  await dbConnection.runMigrations({
    transaction: "none",
  });

  const container = await createContainer(appConfig);
  const app = container.resolve<Application>("app");
  const superAdminUser = container.resolve<SuperAdminConfig>("superAdminUser");
  const usersRepository = container.resolve<UsersTypeormRepository>("usersRepository");
  const policyRepository = container.resolve<PolicyRepository>("policyRepository");
  const authClient = container.resolve<AuthenticationClient>("authenticationClient");
  const passwordGenerator = container.resolve<RandExp>("passwordGenerator");
  const userPasswordIsRandom = container.resolve<boolean>("userPasswordIsRandom");
  const activationTokenUtils = container.resolve<ActivationTokenUtils>("activationTokenUtils");
  const initialUsersProperties = {
    entityManager: new EntityManager(dbConnection),
    usersRepository: usersRepository,
    passwordGenerator,
    userPasswordIsRandom,
    activationTokenUtils,
  };

  global.getBootstrap = () =>
    Object.freeze({
      app,
      dbConnection,
      container,
      superAdminUser,
      usersRepository,
      policyRepository,
      authClient,
      initialUsersProperties,
    });
});

beforeEach("Clear DB and init users and policies", async function () {
  const { dbConnection } = global.getBootstrap();
  if (dbConnection) {
    await clearDb(dbConnection);
    await InitiateTestUsers();
    await InitiateTestPolicies();
  }
});

after("Close test DB connection", async function () {
  const { dbConnection } = global.getBootstrap();
  if (dbConnection) {
    await dbConnection.close();
  }
});

async function InitiateTestPolicies() {
  const initialPolicy = new InitialPolicy();
  return initialPolicy.update(policiesFixture as InitialPolicyData[]);
}

async function InitiateTestUsers() {
  const { initialUsersProperties } = global.getBootstrap();
  const initialUsers = new InitialUsers(initialUsersProperties);
  return initialUsers.update(usersFixture as InitialUserData[]);
}
