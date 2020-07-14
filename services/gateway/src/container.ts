import { TransportProtocol } from "../../../shared/enums/transport-protocol";
import { ApplicationFactory } from "./app/application-factory";
import * as awilix from "awilix";
import { AwilixContainer, Lifetime } from "awilix";
import { AppConfig } from "./config/config";
import { createRouter } from "./app/applications/http/router";
import { CommandBus } from "../../../shared/command-bus";
import { createApp } from "./app/application-factories/create-http-app";
import { errorHandler } from "./middleware/error-handler";
import { appConfigSchema } from "./config/config";
import { createLogger } from "winston";
import { loggerConfiguration } from "./utils/logger-configuration";
import { requestLogger } from "./middleware/request-logger";
import { proxyManager } from "./utils/proxy-manager";

// ROUTING_IMPORTS

const HANDLER_REGEX = /.+Handler$/;

export async function createContainer(config: AppConfig): Promise<AwilixContainer> {
  const { error } = appConfigSchema.validate(config);

  if (error) {
    throw error;
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
    logger: awilix.asValue(logger),
    requestLoggerFormat: awilix.asValue(requestLoggerFormat),
    loggerStream: awilix.asValue(loggerStream),
    requestLogger: awilix.asFunction(requestLogger),
  });

  container.register({
    errorHandler: awilix.asValue(errorHandler),
  });

  const handlersScope = container.createScope();

  container.register({
    commandBus: awilix
      .asClass(CommandBus)
      .classic()
      .singleton(),
  });

  handlersScope.loadModules(["src/**/*.handler.ts", "src/**/*.handler.js"], {
    formatName: "camelCase",
    resolverOptions: {
      lifetime: Lifetime.SCOPED,
      register: awilix.asClass,
    },
  });

  const handlers = Object.keys(handlersScope.registrations)
    .filter(key => key.match(HANDLER_REGEX))
    .map(key => handlersScope.resolve(key));

  container.register({
    handlers: awilix.asValue(handlers),
  });

  if (config.applicationType === TransportProtocol.HTTP) {
    container.register({
      // ROUTING_SETUP
      router: awilix.asFunction(createRouter),
    });
  }

  container.register({
    port: awilix.asValue(config.port),
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

  const { proxyConfigPath, hasAccessEndpointUrl } = config;
  const proxyManagerConfig = await import(proxyConfigPath);

  container.register({
    proxyManager: awilix.asValue(proxyManager({ hasAccessEndpointUrl, proxyManagerConfig})),
  });

  return container;
}
