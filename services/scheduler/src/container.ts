import { BullSchedulerConsumer } from "./scheduler/consumer/bull.consumer";
import { BullScheduler } from "./scheduler/producer/bull.scheduler";
import { ApplicationFactory } from "./app/application-factory";
import * as awilix from "awilix";
import { AwilixContainer, Lifetime } from "awilix";
import { AppConfig, InitialJobsSchema } from "./config/config";
import { createRouter } from "./app/applications/http/router";
import { CommandBus } from "../../../shared/command-bus";
import { createApp } from "./app/application-factories/create-http-app";
import { errorHandler } from "./middleware/error-handler";
import { scheduleRouting } from "./app/features/scheduling/http/routing";
import { TransportProtocol } from "../../../shared/enums/transport-protocol";
import { proxyCall } from "./scheduler/proxy-call/proxy-call";
import { appConfigSchema } from "./config/config";
import { createLogger } from "winston";
import { loggerConfiguration } from "./utils/logger-configuration";
import { requestLogger } from "./middleware/request-logger";
import { createConnection, getCustomRepository } from "typeorm";
import { JobsTypeormRepository } from "./repositories/jobs.typeorm.repository";
import { BullQueueDb } from "./scheduler/bull-db";
import { InitScheduler } from "./utils/init-scheduler";
import { JobDescription } from "./scheduler";
// ROUTING_IMPORTS

const HANDLER_REGEX = /.+Handler$/;

export async function createContainer(config: AppConfig): Promise<AwilixContainer> {
  const { error } = appConfigSchema.validate(config);

  if (error) {
    throw error;
  }

  const initialJobs: JobDescription[] = await import(config.initialJobsJsonPath);
  const inititalJobsValidationResult = InitialJobsSchema.validate(initialJobs);
  if (inititalJobsValidationResult.error) {
    throw inititalJobsValidationResult.error;
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
    initialJobs: awilix.asValue(initialJobs),
    initScheduler: awilix.asClass(InitScheduler).singleton(),
  });

  container.register({
    jobsRepository: awilix.asValue(getCustomRepository(JobsTypeormRepository)),
  });

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
