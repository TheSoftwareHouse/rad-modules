import { AwilixContainer } from "awilix";
import * as awilix from "awilix";
import { AppConfig } from "../config/config";
import { ApplicationFactory } from "../app/application-factory";
import { createApp } from "../app/application-factories/create-http-app";

export async function registerAppHttp(container: AwilixContainer, appConfig: AppConfig) {
  const applicationFactory: ApplicationFactory = container.resolve("applicationFactory");
  const appBuilder = applicationFactory.getApplicationBuilder(appConfig.applicationType);

  container.register({
    // for Express apps, but not necessarily for everything
    app: awilix.asFunction(createApp),
    server: awilix.asFunction(appBuilder).singleton(),
  });

  return container;
}
