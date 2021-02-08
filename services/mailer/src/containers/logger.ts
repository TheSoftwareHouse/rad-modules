import { AwilixContainer } from "awilix";
import * as awilix from "awilix";
import { AppConfig } from "../config/config";
import { requestLogger } from "../middleware/request-logger";
import { createLogger } from "@tshio/logger";

export async function registerLogger(container: AwilixContainer, appConfig: AppConfig) {
  const logger = createLogger({
    LOGGING_LEVEL: appConfig.logger.logLevel,
    APP_NAME: process.env.APP_NAME,
    NODE_ENV: process.env.NODE_ENV,
  });

  const loggerStream = {
    write: (message: any) => logger.info(message.trimEnd()),
  };

  container.register({
    logger: awilix.asValue(logger),
    requestLoggerFormat: awilix.asValue(appConfig.requestLogger.requestLoggerFormat),
    loggerStream: awilix.asValue(loggerStream),
    requestLogger: awilix.asFunction(requestLogger),
  });

  return container;
}
