import { Application } from "./app/application.types";
import { createContainer } from "./container";
import { appConfig as config } from "./config/config";
import { NotificationsBroker } from "./notifications-broker/notifications-broker";
import { createLogger } from "winston";
import { loggerConfiguration } from "./utils/logger-configuration";

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

  const server: Application = container.resolve("server");

  const notificationsServer: NotificationsBroker = container.resolve("notificationsBroker");

  await server.start();

  await notificationsServer.start();
})().catch((error) => {
  logger.error(error);
  process.exit(1);
});
