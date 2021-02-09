import * as awilix from "awilix";
import { AwilixContainer } from "awilix";
import {
  AppConfig,
} from "./config/config";
import { registerAll } from "./containers";

// MODELS_IMPORTS

// ROUTING_IMPORTS

export async function createContainer(config: AppConfig): Promise<AwilixContainer> {
  const container: AwilixContainer = awilix.createContainer({
    injectionMode: awilix.InjectionMode.PROXY,
  });

  return registerAll(container, config);
}
