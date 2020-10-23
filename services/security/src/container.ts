import fetch from "node-fetch";
import { TransportProtocol } from "../../../shared/enums/transport-protocol";
import { TokensRedisRepository } from "./repositories/tokens.redis.repository";
import { RedisRepository } from "./repositories/redis.repository";
import { UsersTypeormRepository } from "./repositories/typeorm/users.typeorm.repository";
import { UsersService } from "./app/features/users/services/users-service";
import { ApplicationFactory } from "./app/application-factory";
import * as awilix from "awilix";
import { AwilixContainer, Lifetime, Resolver } from "awilix";
import {
  AppConfig,
  appConfigSchema,
  AuthenticationStrategy,
  initialPoliciesDataSchema,
  initialUsersDataSchema,
} from "./config/config";
import { createApiRouter } from "./app/applications/http/router";
import { CommandBus } from "../../../shared/command-bus";
import { getAuthenticationClient } from "./app/features/users/strategies/authentication/authentication-client.factory";
import { createConnection, EntityManager, getCustomRepository } from "typeorm";
import { createLogger } from "winston";
import { loggerConfiguration } from "./utils/logger-configuration";
import { PolicyService } from "./app/features/policy/services/policy-service";
import { AttributesTypeormRepository } from "./repositories/typeorm/attributes.typeorm.repository";
import { usersRouting } from "./app/features/users/routing";
import { createApp } from "./app/application-factories/create-http-app";
import { errorHandler } from "./middleware/error-handler";
import { notFoundHandler } from "./middleware/not-found-handler";
import { accessTokenHandler } from "./middleware/access-token-handler";
import { requestLogger } from "./middleware/request-logger";
import { PolicyTypeormRepository } from "./repositories/typeorm/policy.typeorm.repository";
import { policyRouting } from "./app/features/policy/routing";
import { GoogleClient } from "./app/features/users/oauth/google/google-client";
import { FacebookClient } from "./app/features/users/oauth/facebook/facebook-client";
import { InitialUsers, InitialUsersProperties } from "./init/initial-users";
import { JwtUtils } from "./tokens/jwt-utils";
import { ActivationTokenUtils } from "./tokens/activation-token-utils";
import { XSecurityTokenUtils } from "./tokens/x-security-token-utils";
import * as RandExp from "randexp";
import { InitialPolicy } from "./init/initial-policies";
import { InitialApiKeys } from "./init/initial-api-keys";
import { requireAccess } from "./middleware/require-access";
import { AccessKeyTypeormRepository } from "./repositories/typeorm/access-key.typeorm.repository";
import { AccessKeyService } from "./app/features/tokens/services/access-key-service";
import { Mailer } from "./utils/mailer/mailer";
import { tokensRouting } from "./app/features/tokens/routing";

import { attributesRouting } from "./app/features/attributes/routing";
import { publicRouting } from "./app/features/public/routing";
import { MicrosoftClient } from "./app/features/users/oauth/microsoft/microsoft-client";
import { xApiKeyHandler } from "./middleware/x-api-key-handler";
import { getAuthorizationClient } from "./ACL/authorization-client.factory";
import { KeycloakManager } from "./utils/keycloak/keycloak-manager";
import { UsersKeycloakRepository } from "./repositories/keycloak/users.keycloak.repository";
import { PolicyKeycloakRepository } from "./repositories/keycloak/policy.keycloak.repository";
import { EventDispatcher } from "./shared/event-dispatcher";
import PolicyEventSubscriber from "./app/features/policy/subscribers/policy.subscriber";
import UserEventSubscriber from "./app/features/users/subscribers/user.subscriber";
import { httpEventHandler } from "./shared/event-dispatcher/http-event-hander";
import { KeycloakClient } from "./app/features/users/oauth/keycloak/keycloak-client";

// MODELS_IMPORTS

// ROUTING_IMPORTS

const HANDLER_REGEX = /.+Handler$/;

function asArray<T>(resolvers: Resolver<T>[]): Resolver<T[]> {
  return {
    resolve: (container: AwilixContainer) => resolvers.map((r: Resolver<T>) => container.build(r)),
  };
}

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

export async function createContainer(config: AppConfig): Promise<AwilixContainer> {
  const configValidationResult = appConfigSchema.validate(config);
  if (configValidationResult.error) {
    throw configValidationResult.error;
  }

  const initialUsersFromFile = await import(config.initialUsersDataJsonPath);
  const initialUsersData = [{ ...config.superAdminUser, isActive: true }, ...initialUsersFromFile];
  const inititalDataValidationResult = initialUsersDataSchema.validate(initialUsersData);
  if (inititalDataValidationResult.error) {
    throw inititalDataValidationResult.error;
  }

  const initialPoliciesDataFromFile = await import(config.initialPoliciesDataJsonPath);
  const initialPoliciesDataFromConfig = Object.values(config.adminPanelPolicies);
  const initialPoliciesData = [...initialPoliciesDataFromFile, ...initialPoliciesDataFromConfig];
  const inititalPoliciesValidationResult = initialPoliciesDataSchema.validate(initialPoliciesData);
  if (inititalPoliciesValidationResult.error) {
    throw inititalPoliciesValidationResult.error;
  }

  const container: AwilixContainer = awilix.createContainer({
    injectionMode: awilix.InjectionMode.PROXY,
  });

  const logger = createLogger(loggerConfiguration(config.logger.logLevel));
  const { requestLoggerFormat } = config.requestLogger;
  const loggerStream = {
    write: (message: any) => logger.info(message.trimEnd()),
  };

  container.register({
    keycloakManager: awilix.asClass(KeycloakManager).singleton(),
  });

  container.register({
    logger: awilix.asValue(logger),
    requestLoggerFormat: awilix.asValue(requestLoggerFormat),
    loggerStream: awilix.asValue(loggerStream),
    requestLogger: awilix.asFunction(requestLogger),
  });

  const dbConnection = await createConnection(config.dbConfig);

  await dbConnection.runMigrations();

  // Configure initial users
  const userPasswordIsRandom = config.userPassword.isRandom;
  const passwordGenerator = new RandExp(config.passwordRegex);
  passwordGenerator.max = config.resetPassword.randomMaxLength;

  const apiKeyGenerator = new RandExp(config.apiKeyRegex);

  const activationTokenUtils = new ActivationTokenUtils({ userActivationConfig: config.userActivationConfig });

  const { usersRepository, policyRepository } = getRepositories(config.authenticationStrategy);

  const initialUsersProperties: InitialUsersProperties = {
    entityManager: new EntityManager(dbConnection),
    usersRepository: getCustomRepository(UsersTypeormRepository),
    passwordGenerator,
    userPasswordIsRandom,
    activationTokenUtils,
  };
  const initialUsers = new InitialUsers(initialUsersProperties);
  await initialUsers.update(initialUsersData);

  const initialPolicy = new InitialPolicy();
  await initialPolicy.update(initialPoliciesData);

  const initialApiKeys = new InitialApiKeys();
  await initialApiKeys.update(config.initialApiKeys);

  container.register({
    errorHandler: awilix.asValue(errorHandler),
    notFoundHandler: awilix.asValue(notFoundHandler),
    dbConnection: awilix.asValue(dbConnection),
    accessTokenConfig: awilix.asValue(config.accessTokenConfig),
    refreshTokenConfig: awilix.asValue(config.refreshTokenConfig),
    tokenPayloadConfig: awilix.asValue(config.tokenPayloadConfig),
    googleClientConfig: awilix.asValue(config.oauth.googleClientConfig),
    facebookClientConfig: awilix.asValue(config.oauth.facebookClientConfig),
    microsoftClientConfig: awilix.asValue(config.oauth.microsoftClientConfig),
    oauthFirstLogin: awilix.asValue(config.oauth.oauthFirstLogin),
    userActivationConfig: awilix.asValue(config.userActivationConfig),
    adminPanelPolicies: awilix.asValue(config.adminPanelPolicies),
    redisUrl: awilix.asValue(config.redisUrl),
    redisPrefix: awilix.asValue(config.redisPrefix),
    usersRepository,
    attributesRepository: awilix.asValue(getCustomRepository(AttributesTypeormRepository)),
    policyRepository,
    redisRepository: awilix.asClass(RedisRepository).singleton(),
    tokensRepository: awilix.asClass(TokensRedisRepository),
    accessKeyRepository: awilix.asValue(getCustomRepository(AccessKeyTypeormRepository)),
    googleClient: awilix.asClass(GoogleClient),
    facebookClient: awilix.asClass(FacebookClient),
    microsoftClient: awilix.asClass(MicrosoftClient),
    keycloakClient: awilix.asClass(KeycloakClient),
    usersService: awilix.asClass(UsersService),
    policyService: awilix.asClass(PolicyService),
    accessKeyService: awilix.asClass(AccessKeyService),
    superAdminRoleName: awilix.asValue(config.superAdminRoleName),
    superAdminUser: awilix.asValue(config.superAdminUser),
    keycloakClientConfig: awilix.asValue(config.keycloakClientConfig),
    apiKeyHeaderName: awilix.asValue(config.apiKeyHeaderName),
    apiKeyRegex: awilix.asValue(config.apiKeyRegex),
    authenticationStrategy: awilix.asValue(config.authenticationStrategy),
  });

  container.register({
    eventDispatcherCallbackUrls: awilix.asValue(config.eventDispatcherCallbackUrls),
    eventSubscribers: asArray<any>([awilix.asClass(PolicyEventSubscriber), awilix.asClass(UserEventSubscriber)]),
    eventDispatcher: awilix.asClass(EventDispatcher).classic().singleton(),
    httpEventHandler: awilix.asFunction(httpEventHandler),
    myFetch: awilix.asFunction(() => fetch),
  });

  const handlersScope = container.createScope();

  container.register({
    commandBus: awilix.asClass(CommandBus).classic().singleton(),
  });

  handlersScope.loadModules(["src/**/*.handler.ts", "src/**/*.handler.js"], {
    formatName: "camelCase",
    resolverOptions: {
      lifetime: Lifetime.SCOPED,
      register: awilix.asClass,
    },
  });

  const handlers = Object.keys(handlersScope.registrations)
    .filter((key) => key.match(HANDLER_REGEX))
    .map((key) => handlersScope.resolve(key));

  container.register({
    handlers: awilix.asValue(handlers),
  });

  if (config.applicationType === TransportProtocol.HTTP) {
    container.register({
      usersRouting: awilix.asFunction(usersRouting),
      publicRouting: awilix.asFunction(publicRouting),
      policyRouting: awilix.asFunction(policyRouting),
      tokensRouting: awilix.asFunction(tokensRouting),
      attributesRouting: awilix.asFunction(attributesRouting),
      apiRouter: awilix.asFunction(createApiRouter),
      // ROUTING_SETUP
    });
  }

  const AuthenticationClientClass = await getAuthenticationClient(config.authenticationStrategy, config);
  const AuthorizationClientClass = await getAuthorizationClient(config.authenticationStrategy);

  container.register({
    authenticationClient: awilix.asClass(AuthenticationClientClass),
    requireAccess: awilix.asFunction(requireAccess),
    authorizationClient: awilix.asClass(AuthorizationClientClass),
    accessTokenHandler: awilix.asValue(accessTokenHandler),
    xApiKeyHandler: awilix.asFunction(xApiKeyHandler),
  });

  container.register({
    port: awilix.asValue(config.port),
    apiUrl: awilix.asValue(config.apiUrl),
    applicationFactory: awilix.asClass(ApplicationFactory),
  });

  const applicationFactory: ApplicationFactory = container.resolve("applicationFactory");
  const appBuilder = applicationFactory.getApplicationBuilder(config.applicationType);

  container.register({
    // TODO: handle this better - the assumption that we have both app and the server works fine
    // for Express apps, but not necessarily for everything
    app: awilix.asFunction(createApp),
    server: awilix.asFunction(appBuilder).singleton(),
  });

  container.register({
    jwtUtils: awilix.asClass(JwtUtils).singleton(),
    xSecurityTokenUtils: awilix.asClass(XSecurityTokenUtils).singleton(),
    activationTokenUtils: awilix.asClass(ActivationTokenUtils).singleton(),
  });

  container.register({
    passwordGenerator: awilix.asValue(passwordGenerator),
    passwordRegex: awilix.asValue(config.passwordRegex),
    userPasswordIsRandom: awilix.asValue(userPasswordIsRandom),
    apiKeyGenerator: awilix.asValue(apiKeyGenerator),
  });

  container.register({
    mailerConfig: awilix.asValue(config.mailer),
    mailer: awilix.asClass(Mailer).singleton(),
  });

  return container;
}
