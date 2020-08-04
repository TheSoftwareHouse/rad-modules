import "mocha";
import { AwilixContainer } from "awilix";
import { createConnection, Connection } from "typeorm";
import { appConfig, SuperAdminConfig } from "../config/config";
import { createContainer } from "../container";
import { InitialUsersProperties } from "../init/initial-users";
import { EntityManager } from "typeorm";
import * as RandExp from "randexp";
import { UsersTypeormRepository } from "../repositories/typeorm/users.typeorm.repository";
import { ActivationTokenUtils } from "../tokens/activation-token-utils";
import { InitialPolicy, InitialPolicyData } from "../init/initial-policies";
import { usersFixture, hashedPasswords, testPasswordsSalt } from "./fixtures/users.fixture";
import { policiesFixture } from "./fixtures/policies.fixture";
import { AuthenticationClient } from "../app/features/users/strategies/authentication/authentication-client.types";
import { PolicyRepository } from "../repositories/policy.repository";
import { Application } from "../app/application.types";
import { createUserModel } from "../app/features/users/models/user.model";
import { AttributeModel } from "../app/features/users/models/attribute.model";

export interface BootstrapData {
  app: Application;
  dbConnection: Connection;
  container: AwilixContainer;
  superAdminUser: SuperAdminConfig;
  usersRepository: UsersTypeormRepository;
  policyRepository: PolicyRepository;
  authClient: AuthenticationClient;
  initialUsersProperties: InitialUsersProperties;
  apiKeyRegex: RegExp;
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
    const query = `TRUNCATE TABLE ${entities.map((entity: any) => `"${entity.tableName}"`).join(",")} CASCADE;`;
    return connection.query(query);
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
  const apiKeyRegex = container.resolve<RegExp>("apiKeyRegex");
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
      apiKeyRegex,
    });
});

beforeEach("Clear DB and init users and policies", async function () {
  const { dbConnection } = global.getBootstrap();
  if (dbConnection) {
    await clearDb(dbConnection);
    await InitiateTestPolicies();
    await InitiateTestUsers();
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
  const users = usersFixture.map((userData) => {
    const attributes = userData.attributes.map((attribute) => AttributeModel.create({ name: attribute }));

    return createUserModel({
      username: userData.username,
      password: hashedPasswords[userData.password] || "No password in hashedPasswords",
      passwordSalt: testPasswordsSalt,
      attributes,
      isActive: true,
      activationToken: null,
      activationTokenExpireDate: null,
    });
  });

  const resolvedUsers = await Promise.all(users);

  return initialUsersProperties.entityManager.transaction(async (transactionalEntityManager) => {
    await transactionalEntityManager.save(resolvedUsers);
  });
}
