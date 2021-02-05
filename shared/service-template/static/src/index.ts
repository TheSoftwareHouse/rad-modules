import { Application } from "./app/application.types";
import { createContainer } from "./container";
import { appConfig as config } from "./config/config";
import { createLogger } from "@tshio/logger";

const logger = createLogger({
  LOGGING_LEVEL: config.logger.logLevel,
  APP_NAME: process.env.APP_NAME,
  NODE_ENV: process.env.NODE_ENV,
});

process.on('uncaughtException', (err: any) => {
  logger.error(err);
  process.exit(1);
});

process.on('unhandledRejection', (err: any) => {
  logger.error(err);
  process.exit(1);
});

(async () => {
  const container = await createContainer(config);

  const server: Application = container.resolve("server");

  await server.start();
})()
  .catch(error => {
    logger.error(error);
    process.exit(1);
  });
