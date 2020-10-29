import { Application } from "./app/application.types";
import { createContainer } from "./container";
import { appConfig as config } from "./config/config";
import { SchedulerConsumer } from "./scheduler/consumer/consumer.types";
import { createLogger } from "winston";
import { loggerConfiguration } from "./utils/logger-configuration";
import { JobDescription } from "./scheduler";
import { InitScheduler } from "./utils/init-scheduler";

const logger = createLogger(loggerConfiguration(config.logger.logLevel));

process.on("uncaughtException", (err: any) => {
  logger.error(err);
  process.exit(1);
});

process.on("unhandledRejection", (err: any) => {
  logger.error(err);
  process.exit(1);
});

(async () => {
  const container = await createContainer(config);

  const consumer: SchedulerConsumer = container.resolve("schedulerConsumer");
  consumer.startListening();

  const server: Application = container.resolve("server");

  const initScheduler: InitScheduler = container.resolve("initScheduler");
  const initialJobs: JobDescription[] = container.resolve("initialJobs");

  await initScheduler.addInitialJobs(initialJobs);

  await server.start();
})().catch((error) => {
  logger.error(error);
  process.exit(1);
});
