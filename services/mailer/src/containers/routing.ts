import { AwilixContainer } from "awilix";
import * as awilix from "awilix";
import { AppConfig } from "../config/config";
import { TransportProtocol } from "../../../../shared/enums/transport-protocol";
import { mailerRouting } from "../app/features/mailer/routing";
import { createRouter } from "../app/applications/http/router";

export async function registerRouting(container: AwilixContainer, appConfig: AppConfig) {
  if (appConfig.applicationType === TransportProtocol.HTTP) {
    container.register({
      mailerRouting: awilix.asFunction(mailerRouting),
      // ROUTING_SETUP
      router: awilix.asFunction(createRouter),
    });
  }

  return container;
}
