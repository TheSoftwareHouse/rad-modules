import * as awilix from "awilix";
import { AwilixContainer } from "awilix";
import { AppConfig, appConfigSchema } from "./config/config";
import * as containers from "./containers";

export async function createContainer(config: AppConfig): Promise<AwilixContainer> {
  const { error } = appConfigSchema.validate(config);

  if (error) {
    throw error;
  }

  const container: AwilixContainer = awilix.createContainer({
    injectionMode: awilix.InjectionMode.PROXY,
  });

  await containers.registerAll(container, config);

  return container;
}
