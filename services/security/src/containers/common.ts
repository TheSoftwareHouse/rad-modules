import { AwilixContainer, Resolver } from "awilix";
import * as awilix from "awilix";
import { CommandBus } from "@tshio/command-bus";
import { AppConfig } from "../config/config";
import { ApplicationFactory } from "../app/application-factory";
import { GoogleClient } from "../app/features/users/oauth/google/google-client";
import { FacebookClient } from "../app/features/users/oauth/facebook/facebook-client";
import { MicrosoftClient } from "../app/features/users/oauth/microsoft/microsoft-client";
import { UsersService } from "../app/features/users/services/users-service";
import { PolicyService } from "../app/features/policy/services/policy-service";
import { AccessKeyService } from "../app/features/tokens/services/access-key-service";
import PolicyEventSubscriber from "../app/features/policy/subscribers/policy.subscriber";
import UserEventSubscriber from "../app/features/users/subscribers/user.subscriber";
import { EventDispatcher } from "../shared/event-dispatcher";
import { httpEventHandler } from "../shared/event-dispatcher/http-event-hander";
import { getAuthenticationClient } from "../app/features/users/strategies/authentication/authentication-client.factory";
import { getAuthorizationClient } from "../ACL/authorization-client.factory";
import { requireAccess } from "../middleware/require-access";
import { accessTokenHandler } from "../middleware/access-token-handler";
import { xApiKeyHandler } from "../middleware/x-api-key-handler";

function asArray<T>(resolvers: Resolver<T>[]): Resolver<T[]> {
  return {
    resolve: (container: AwilixContainer) => resolvers.map((r: Resolver<T>) => container.build(r)),
  };
}

export async function registerCommonDependencies(container: AwilixContainer, appConfig: AppConfig) {
  container.register({
    commandBus: awilix.asClass(CommandBus).classic().singleton(),
  });

  container.register({
    accessTokenConfig: awilix.asValue(appConfig.accessTokenConfig),
    refreshTokenConfig: awilix.asValue(appConfig.refreshTokenConfig),
    tokenPayloadConfig: awilix.asValue(appConfig.tokenPayloadConfig),
    googleClientConfig: awilix.asValue(appConfig.oauth.googleClientConfig),
    facebookClientConfig: awilix.asValue(appConfig.oauth.facebookClientConfig),
    microsoftClientConfig: awilix.asValue(appConfig.oauth.microsoftClientConfig),
    oauthFirstLogin: awilix.asValue(appConfig.oauth.oauthFirstLogin),
    userActivationConfig: awilix.asValue(appConfig.userActivationConfig),
    adminPanelPolicies: awilix.asValue(appConfig.adminPanelPolicies),
    googleClient: awilix.asClass(GoogleClient),
    facebookClient: awilix.asClass(FacebookClient),
    microsoftClient: awilix.asClass(MicrosoftClient),
    usersService: awilix.asClass(UsersService),
    policyService: awilix.asClass(PolicyService),
    accessKeyService: awilix.asClass(AccessKeyService),
    superAdminRoleName: awilix.asValue(appConfig.superAdminRoleName),
    superAdminUser: awilix.asValue(appConfig.superAdminUser),
    apiKeyHeaderName: awilix.asValue(appConfig.apiKeyHeaderName),
    apiKeyRegex: awilix.asValue(appConfig.apiKeyRegex),
    authenticationStrategy: awilix.asValue(appConfig.authenticationStrategy),
    passwordRegex: awilix.asValue(appConfig.passwordRegex),
    userPasswordIsRandom: awilix.asValue(appConfig.userPassword.isRandom),
  });

  container.register({
    port: awilix.asValue(appConfig.port),
    apiUrl: awilix.asValue(appConfig.apiUrl),
    applicationFactory: awilix.asClass(ApplicationFactory),
  });

  container.register({
    eventDispatcherCallbackUrls: awilix.asValue(appConfig.eventDispatcherCallbackUrls),
    eventSubscribers: asArray<any>([awilix.asClass(PolicyEventSubscriber), awilix.asClass(UserEventSubscriber)]),
    eventDispatcher: awilix.asClass(EventDispatcher).classic().singleton(),
    httpEventHandler: awilix.asFunction(httpEventHandler),
  });

  const AuthenticationClientClass = await getAuthenticationClient(appConfig.authenticationStrategy, appConfig);
  const AuthorizationClientClass = await getAuthorizationClient(appConfig.authenticationStrategy);

  container.register({
    authenticationClient: awilix.asClass(AuthenticationClientClass),
    requireAccess: awilix.asFunction(requireAccess),
    authorizationClient: awilix.asClass(AuthorizationClientClass),
    accessTokenHandler: awilix.asValue(accessTokenHandler),
    xApiKeyHandler: awilix.asFunction(xApiKeyHandler),
  });

  return container;
}
