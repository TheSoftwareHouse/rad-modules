import { AwilixContainer } from "awilix";
import "mocha";
import { appConfig } from "../config/config";
import { createContainer } from "../container";

export interface Global {
  container: AwilixContainer;
}

declare const global: Global;

before(async () => {
  global.container = await createContainer(appConfig);
});
