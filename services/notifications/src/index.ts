import { Application } from "./app/application.types";
import { createContainer } from "./container";
import { appConfig as config } from "./config/config";
import { NotificationsBroker } from "./notifications-broker/notifications-broker";
import { createLogger } from "@tshio/logger";

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

  const server: Application = container.resolve("server");

  const notificationsServer: NotificationsBroker = container.resolve("notificationsBroker");

  await server.start();

  await notificationsServer.start();
})().catch((error) => {
  logger.error(error);
  process.exit(1);
});
