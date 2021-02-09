import { AwilixContainer } from "awilix";
import * as awilix from "awilix";
import { AppConfig } from "../config/config";
import { Mailer } from "../utils/mailer/mailer";

export async function registerMailer(container: AwilixContainer, appConfig: AppConfig) {
  container.register({
    mailerConfig: awilix.asValue(appConfig.mailer),
    mailer: awilix.asClass(Mailer).singleton(),
  });

  return container;
}
