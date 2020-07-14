import { TransportProtocol } from "../../../shared/enums/transport-protocol";
import { ApplicationFactory } from "./app/application-factory";
import * as awilix from "awilix";
import { AwilixContainer, Lifetime } from "awilix";
import { AppConfig, appConfigSchema } from "./config/config";
import { createRouter } from "./app/applications/http/router";
import { CommandBus } from "../../../shared/command-bus";
import { createApp } from "./app/application-factories/create-http-app";
import { errorHandler } from "./middleware/error-handler";
import { mailerRouting } from "./app/features/mailer/routing";
import { MailSender } from "./utils/mail-sender";
import { createLogger } from "winston";
import { loggerConfiguration } from "./utils/logger-configuration";
import { requestLogger } from "./middleware/request-logger";
import { EmailQueue } from "./utils/worker/email-queue";
import { BatchEmailProcessing } from "./utils/worker/batch-email-processing";
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
    mailerConfig: awilix.asValue(config.mailerConfig),
    redisUrl: awilix.asValue(config.redisUrl),
    redisPrefix: awilix.asValue(config.redisPrefix),
    queueName: awilix.asValue(config.queueName),
    emailQueue: awilix.asClass(EmailQueue),
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
      mailerRouting: awilix.asFunction(mailerRouting),
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

  const { mailerConfig } = config;
  const mailSender = new MailSender(mailerConfig);

  container.register({
    mailSender: awilix.asValue(mailSender),
    batchEmailProcessing: awilix.asClass(BatchEmailProcessing),
  });

  return container;
}
