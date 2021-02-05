import * as awilix from "awilix";
import { createLogger } from "@tshio/logger";
import { AwilixContainer, Lifetime } from "awilix";
import { createConnection, getCustomRepository } from "typeorm";
import { CommandBus } from "@tshio/command-bus";
import { JwtUtils } from "./tokens/jwt-utils";
import { createApp } from "./app/application-factories/create-http-app";
import { createRouter } from "./app/applications/http/router";
import { errorHandler } from "./middleware/error-handler";
import { requestLogger } from "./middleware/request-logger";
import { TransportProtocol } from "../../../shared/enums/transport-protocol";
import { ApplicationFactory } from "./app/application-factory";
import { NotificationsBroker } from "./notifications-broker/notifications-broker";
import { notificationsRouting } from "./app/features/notifications/routing";
import { AppConfig, appConfigSchema } from "./config/config";
import { NotificationsTypeormRepository } from "./repositories/typeorm/notifications.typeorm.repository";
import { CustomBroker } from "./notifications-broker/brokers/custom-broker";
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

  const logger = createLogger({
    LOGGING_LEVEL: config.logger.logLevel,
    APP_NAME: process.env.APP_NAME,
    NODE_ENV: process.env.NODE_ENV,
  });
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

  const dbConnection = await createConnection(config.dbConfig);
  await dbConnection.runMigrations();

  container.register({
    dbConnection: awilix.asValue(dbConnection),
    errorHandler: awilix.asValue(errorHandler),
    socketDefaultName: awilix.asValue("default-all"),
    socketAuthorizedName: awilix.asValue("default-authorized"),
    socketUnauthorizedName: awilix.asValue("default-unauthorized"),
  });

  container.register({
    notificationsRepository: awilix.asValue(getCustomRepository(NotificationsTypeormRepository)),
  });

  container.register({
    customBroker: awilix.asClass(CustomBroker),
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
    commandHandlers: awilix.asValue(handlers),
  });

  if (config.applicationType === TransportProtocol.HTTP) {
    container.register({
      notificationsRouting: awilix.asFunction(notificationsRouting),
      // ROUTING_SETUP
      router: awilix.asFunction(createRouter),
    });
  }

  container.register({
    port: awilix.asValue(config.port),
    transportConfig: awilix.asValue(config.transportConfig),
    transportType: awilix.asValue(config.transportType),
    allowAnonymous: awilix.asValue(config.allowAnonymous),
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
    // TODO: handle this better - the assumption that we have both app and the server works fine
    // for Express apps, but not necessarily for everything
    accessTokenConfig: awilix.asValue(config.accessTokenConfig),
    jwtUtils: awilix.asClass(JwtUtils).singleton(),
  });

  container.register({
    notificationsBroker: awilix.asClass(NotificationsBroker).singleton(),
  });

  return container;
}
