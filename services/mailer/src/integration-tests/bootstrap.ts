import "mocha";
import { AwilixContainer } from "awilix";
import { Application } from "../app/application.types";
import { createContainer } from "../container";
import { appConfig } from "../config/config";
import { createClient } from "redis";

export interface BootstrapData {
  app: Application;
  container: AwilixContainer;
  redisUrl: string;
  redisPrefix: string;
  queueName: string;
}

export type GetBootstrap = () => BootstrapData;

export interface GlobalData extends NodeJS.Global {
  getBootstrap: GetBootstrap;
  bootstrap: BootstrapData;
}

declare const global: GlobalData;

before("Create container and dependencies", async function () {
  const container = await createContainer(appConfig);
  const app = container.resolve<Application>("app");
  const redisUrl = container.resolve<string>("redisUrl");
  const redisPrefix = container.resolve<string>("redisPrefix");
  const queueName = container.resolve<string>("queueName");

  global.getBootstrap = () =>
    Object.freeze({
      app,
      container,
      redisUrl,
      redisPrefix,
      queueName,
    });
});

beforeEach("Clean email queue", async function () {
  const { redisPrefix, redisUrl, queueName } = global.getBootstrap();

  const redisClient = createClient({
    url: redisUrl,
    prefix: redisPrefix,
  });

  redisClient.del(queueName);
});

after("Close redis connection", async function () {
  const { redisPrefix, redisUrl } = global.getBootstrap();

  const redisClient = createClient({
    url: redisUrl,
    prefix: redisPrefix,
  });

  redisClient.end(true);
});
