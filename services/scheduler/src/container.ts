import { BullSchedulerConsumer } from "./scheduler/consumer/bull.consumer";
import { BullScheduler } from "./scheduler/producer/bull.scheduler";
import { ApplicationFactory } from "./app/application-factory";
import * as awilix from "awilix";
import { AwilixContainer, Lifetime } from "awilix";
import { AppConfig, manifestSchema } from "./config/config";
import { createRouter } from "./app/applications/http/router";
import { CommandBus } from "../../../shared/command-bus";
import { createApp } from "./app/application-factories/create-http-app";
import { errorHandler } from "./middleware/error-handler";
import { scheduleRouting } from "./app/features/scheduling/http/routing";
import * as manifest from "./config/manifest.json";
import * as fs from "fs";
import { TransportProtocol } from "../../../shared/enums/transport-protocol";
import { proxyCall } from "./scheduler/proxy-call/proxy-call";
import { appConfigSchema } from "./config/config";
import { createLogger } from "winston";
import { loggerConfiguration } from "./utils/logger-configuration";
import { requestLogger } from "./middleware/request-logger";
import { createConnection, getCustomRepository } from "typeorm";
import { JobsTypeormRepository } from "./repositories/jobs.typeorm.repository";
import { ManifestService } from "./scheduler";
import { BullQueueDb } from "./scheduler/bull-db";
// ROUTING_IMPORTS

const HANDLER_REGEX = /.+Handler$/;

const getMergedManifest = async (manifestPath: string, manifestServices: ManifestService[]) => {
  if (fs.existsSync(manifestPath)) {
    const externalManifest = await import(manifestPath);
    return [...externalManifest, ...manifestServices];
  }
  return manifestServices;
};

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

  const dbConnection = await createConnection(config.dbConfig);
  await dbConnection.runMigrations();

  container.register({
    dbConnection: awilix.asValue(dbConnection),
    errorHandler: awilix.asValue(errorHandler),
    redisUrl: awilix.asValue(config.redisUrl),
    schedulerConfig: awilix.asValue(config.schedulerConfig),
    scheduler: awilix.asClass(BullScheduler).singleton(),
    schedulerConsumer: awilix.asClass(BullSchedulerConsumer).singleton(),
    dbBull: awilix.asClass(BullQueueDb).singleton(),
  });

  container.register({
    jobsRepository: awilix.asValue(getCustomRepository(JobsTypeormRepository)),
  });

  const mergedManifest = await getMergedManifest(config.externalManifestPath, manifest as ManifestService[]);
  const manifestValidationResult = manifestSchema.validate(mergedManifest);
  if (manifestValidationResult.error) {
    throw manifestValidationResult.error;
  }
  container.register({ manifest: awilix.asValue(mergedManifest) });

  container.register({
    commandBus: awilix.asClass(CommandBus).classic().singleton(),
  });

  const handlersScope = container.createScope();

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
      scheduleRouting: awilix.asFunction(scheduleRouting),
      // ROUTING_SETUP
      router: awilix.asFunction(createRouter),
    });
  }

  container.register({
    port: awilix.asValue(config.port),
    applicationFactory: awilix.asClass(ApplicationFactory),
    proxyCall: awilix.asFunction(proxyCall),
  });

  const applicationFactory: ApplicationFactory = container.resolve("applicationFactory");
  const appBuilder = applicationFactory.getApplicationBuilder(config.applicationType);

  container.register({
    // TODO: handle this better - the assumption that we have both app and the server works fine
    // for Express apps, but not necessarily for everything
    app: awilix.asFunction(createApp),
    server: awilix.asFunction(appBuilder).singleton(),
  });

  return container;
}
