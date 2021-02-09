import { AwilixContainer } from "awilix";
import * as awilix from "awilix";
import { CommandBus } from "@tshio/command-bus";
import { AppConfig } from "../config/config";
import { EmailQueue } from "../utils/worker/email-queue";
import { ApplicationFactory } from "../app/application-factory";

export async function registerCommonDependencies(container: AwilixContainer, appConfig: AppConfig) {
  container.register({
    commandBus: awilix.asClass(CommandBus).classic().singleton(),
  });

  container.register({
    mailerConfig: awilix.asValue(appConfig.mailerConfig),
    redisPrefix: awilix.asValue(appConfig.redisPrefix),
    queueName: awilix.asValue(appConfig.queueName),
    emailQueue: awilix.asClass(EmailQueue),
    port: awilix.asValue(appConfig.port),
    applicationFactory: awilix.asClass(ApplicationFactory),
  });

  return container;
}
