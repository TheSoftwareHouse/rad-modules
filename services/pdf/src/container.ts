import { TransportProtocol } from "../../../shared/enums/transport-protocol";
import { ApplicationFactory } from "./app/application-factory";
import * as awilix from "awilix";
import { AwilixContainer, Lifetime } from "awilix";
import { AppConfig } from "./config/config";
import { createRouter } from "./app/applications/http/router";
import { CommandBus } from "../../../shared/command-bus";
import { createApp } from "./app/application-factories/create-http-app";
import { errorHandler } from "./middleware/error-handler";
import { AppConfigSchema } from "./config/config";
import { createLogger } from "winston";
import { loggerConfiguration } from "./utils/logger-configuration";
import { requestLogger } from "./middleware/request-logger";
import { pdfRouting } from "./app/features/pdf/routing";
import { ChromiumBrowser } from "./utils/chromium-browser";

import { downloadPdfRouting } from "./app/features/download-pdf/routing";
import { FileRemover } from "./utils/file-remover";
// ROUTING_IMPORTS

const HANDLER_REGEX = /.+Handler$/;

export async function createContainer(config: AppConfig): Promise<AwilixContainer> {
  const { error } = AppConfigSchema.validate(config);

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
    config: awilix.asValue(config),
    browserConfig: awilix.asValue({
      executablePath: process.env.CHROMIUM_PATH,
      args: ["--no-sandbox"],
    }),
    chromiumBrowser: awilix.asClass(ChromiumBrowser).singleton(),
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
      pdfRouting: awilix.asFunction(pdfRouting),
      downloadPdfRouting: awilix.asFunction(downloadPdfRouting),
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

  if (config.autoRemoveExpiredFilesEnabled) {
    const fileRemover = new FileRemover();
    setInterval(async () => {
      await fileRemover.removeExpiredFiles();
    }, config.expiration * 1000);
  }

  return container;
}
