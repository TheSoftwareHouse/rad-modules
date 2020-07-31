import "mocha";
import { AwilixContainer } from "awilix";
import { createConnection, Connection } from "typeorm";
import { appConfig } from "../config/config";
import { createContainer } from "../container";

export interface Global {
  dbConnection: Connection;
  container: AwilixContainer;
}

declare const global: Global;

const truncateTables = async () => {
  if (global.dbConnection) {
    await global.dbConnection.query('TRUNCATE TABLE "Notification" CASCADE');
  }
};

before(async () => {
  const dbConnection = await createConnection({
    name: "notifications-integration-tests-connection",
    ...appConfig.dbConfig,
    logging: false,
  });

  await dbConnection.dropDatabase();

  global.container = await createContainer(appConfig);
  global.dbConnection = dbConnection;
});

beforeEach(async () => {
  await truncateTables();
});
