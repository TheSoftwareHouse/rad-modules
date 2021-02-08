import { AwilixContainer } from "awilix";
import * as awilix from "awilix";
import { AppConfig } from "../config/config";
import { TransportProtocol } from "../../../../shared/enums/transport-protocol";
import { createApiRouter } from "../app/applications/http/router";
import { usersRouting } from "../app/features/users/routing";
import { publicRouting } from "../app/features/public/routing";
import { policyRouting } from "../app/features/policy/routing";
import { tokensRouting } from "../app/features/tokens/routing";
import { attributesRouting } from "../app/features/attributes/routing";

export async function registerRouting(container: AwilixContainer, appConfig: AppConfig) {
  if (appConfig.applicationType === TransportProtocol.HTTP) {
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

  return container;
}
