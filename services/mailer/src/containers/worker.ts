import { AwilixContainer } from "awilix";
import * as awilix from "awilix";
import { AppConfig } from "../config/config";
import { EmailQueue } from "../utils/worker/email-queue";

export async function registerWorker(container: AwilixContainer, appConfig: AppConfig) {
  container.register({
    redisUrl: awilix.asValue(appConfig.redisUrl),
    redisPrefix: awilix.asValue(appConfig.redisPrefix),
    queueName: awilix.asValue(appConfig.queueName),
    emailQueue: awilix.asClass(EmailQueue),
  });

  return container;
}
