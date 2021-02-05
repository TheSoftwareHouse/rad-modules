import { Application } from "./app/application.types";
import { createContainer } from "./container";
import { appConfig as config } from "./config/config";
import { SchedulerConsumer } from "./scheduler/consumer/consumer.types";
import { createLogger } from "@tshio/logger";
import { JobDescription } from "./scheduler";
import { InitScheduler } from "./utils/init-scheduler";

const logger = createLogger({
  LOGGING_LEVEL: config.logger.logLevel,
  APP_NAME: process.env.APP_NAME,
  NODE_ENV: process.env.NODE_ENV,
});

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
