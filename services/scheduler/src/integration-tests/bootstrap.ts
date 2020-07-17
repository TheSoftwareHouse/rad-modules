import "mocha";
import { createConnection, Connection } from "typeorm";
import { appConfig } from "../config/config";
import { createContainer } from "../container";
import { AwilixContainer } from "awilix";

export interface GlobalData extends NodeJS.Global {
  dbConnection: Connection;
  container: AwilixContainer;
}

declare const global: GlobalData;

const truncateTables = async () => {
  if (global.dbConnection) {
    await global.dbConnection.query('TRUNCATE TABLE "Job" CASCADE');
  }
};

before(async () => {
  const dbConnection = await createConnection({
    name: "scheduler-integration-tests-connection",
    ...appConfig.dbConfig,
    logging: false,
  });
  await dbConnection.dropDatabase();

  global.container = await createContainer(appConfig);
  global.dbConnection = dbConnection;
});

beforeEach(async () => {
  await truncateTables();
  // clear redis
});
