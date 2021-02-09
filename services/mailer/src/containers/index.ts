import { AwilixContainer } from "awilix";
import { AppConfig } from "../config/config";
import { registerCommandHandlers } from "./command-handlers";
import { registerCommonDependencies } from "./common";
import { registerLogger } from "./logger";
import { registerMailSender } from "./mail-sender";
import { registerMiddlewares } from "./middlewares";
import { registerWorker } from "./worker";
import { registerRouting } from "./routing";
import { registerAppHttp } from "./app-http";

export async function registerAll(container: AwilixContainer, appConfig: AppConfig) {
  await registerCommonDependencies(container, appConfig);
  await registerLogger(container, appConfig);
  await registerCommandHandlers(container);
  await registerMiddlewares(container);
  await registerMailSender(container, appConfig);
  await registerWorker(container, appConfig);
  await registerRouting(container, appConfig);
  await registerAppHttp(container, appConfig);
}

export {
  registerCommandHandlers,
  registerCommonDependencies,
  registerLogger,
  registerMailSender,
  registerMiddlewares,
  registerWorker,
  registerRouting,
  registerAppHttp,
};
