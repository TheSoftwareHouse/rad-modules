import { AwilixContainer } from "awilix";
import { AppConfig } from "../config/config";
import { registerCommandHandlers } from "./command-handlers";
import { registerCommonDependencies } from "./common";
import { registerLogger } from "./logger";
import { registerMiddlewares } from "./middlewares";
import { registerRouting } from "./routing";
import { registerAppHttp } from "./app-http";
import { registerDatabase } from "./database";
import { registerKeycloak } from "./keycloak";
import { registerMailer } from "./mailer";
import { registerRedis } from "./redis";
import { registerUtils } from "./utils";

export async function registerAll(container: AwilixContainer, appConfig: AppConfig) {
  await registerCommonDependencies(container, appConfig);
  await registerUtils(container, appConfig);
  await registerLogger(container, appConfig);
  await registerDatabase(container, appConfig);
  await registerRedis(container, appConfig);
  await registerCommandHandlers(container);
  await registerKeycloak(container, appConfig);
  await registerMailer(container, appConfig);
  await registerMiddlewares(container);
  await registerRouting(container, appConfig);
  await registerAppHttp(container, appConfig);

  return container;
}

export {
  registerCommonDependencies,
  registerUtils,
  registerLogger,
  registerDatabase,
  registerRedis,
  registerCommandHandlers,
  registerKeycloak,
  registerMailer,
  registerMiddlewares,
  registerRouting,
  registerAppHttp,
};
